import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Redis } from 'ioredis';
import { InjectRedisClient } from '../redis/decorator/redis.decorator.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateLeadDto } from './dto/create-lead.dto.js';
import { FastifyReply, FastifyRequest } from 'fastify';
import * as XLSX from 'xlsx';
import { UpdateStatusDto } from './dto/update-status.dto.js';
import { LeadStatus } from '../../generated/prisma/enums.js';

enum ExportFileExtension {
  XLSX = 'xlsx',
  CSV = 'csv',
}

@Injectable()
export class LeadService {
  constructor(
    private prisma: PrismaService,
    @InjectRedisClient() private redis: Redis,
  ) {}

  async create(createLeadDto: CreateLeadDto) {
    const phoneExists = await this.prisma.lead.findUnique({
      where: { phone: createLeadDto.phone },
    });

    if (phoneExists) {
      throw new ConflictException('تم التسجيل مسبقًا بهذا الرقم');
    }

    const oldLeads = await this.prisma.phoneRegistry.findUnique({
      where: { phoneNumber: createLeadDto.phone },
    });

    if (oldLeads) {
      throw new ConflictException('تم التسجيل مسبقًا بهذا الرقم');
    }

    const template = await this.prisma.formTemplate.findUnique({
      where: { slug: createLeadDto.templateSlug },
      include: { questions: true },
    });

    if (!template) {
      throw new NotFoundException('Template غير موجود');
    }

    const errors: { field: string; message: string }[] = [];

    const answersArray = createLeadDto.answers.map((a) => ({
      name: a.name,
      question: a.question,
      answer: a.answer,
    }));

    for (const q of template.questions) {
      const found = answersArray.find((a) => a.name === q.name);
      const value = found?.answer;

      if (
        q.required &&
        (value === undefined || value === null || value === '')
      ) {
        throw new BadRequestException({
          field: q.name,
          message: `${q.label} مطلوب`,
        });
      }

      if (value === undefined || value === null || value === '') continue;

      // NUMBER
      if (q.type === 'NUMBER') {
        const num = Number(value);

        if (isNaN(num)) {
          throw new BadRequestException({
            field: q.name,
            message: `${q.label} لازم يكون رقم`,
          });
        }

        const rules = q.rules as { min?: number; max?: number } | null;

        if (rules?.min !== undefined && num < rules.min) {
          errors.push({
            field: q.name,
            message: `${q.label} لازم يكون ≥ ${rules.min}`,
          });
        }

        if (rules?.max !== undefined && num > rules.max) {
          errors.push({
            field: q.name,
            message: `${q.label} لازم يكون ≤ ${rules.max}`,
          });
        }

        if (found) {
          found.answer = num;
        }
      }

      if (q.type === 'TEXT') {
        if (typeof value !== 'string') {
          errors.push({
            field: q.name,
            message: `${q.label} لازم يكون نص`,
          });
        }
      }

      console.log(q.name);
      if (q.name === 'contractDate') {
        if (value === 'no') {
          throw new BadRequestException({
            field: q.name,
            message: `يجب ان يمر سنة علي تاريخ تعاقد`,
          });
        }
      }
    }

    if (errors.length > 0) {
      throw new BadRequestException({
        message: 'خطئ في تحقق البيانات',
        errors,
      });
    }

    try {
      const result = await this.prisma.$transaction(async (tx) => {
        const submission = await tx.submission.create({
          data: {
            formTemplateSlug: createLeadDto.templateSlug,
            answers: answersArray, // ✅ ARRAY كامل بالـ label
          },
        });

        const lead = await tx.lead.create({
          data: {
            name: createLeadDto.name,
            job: createLeadDto.job,
            phone: createLeadDto.phone,
            submissionId: submission.id,
          },
        });

        return lead;
      });

      return result;
    } catch (error: any) {
      if (error.code === 'P2002') {
        throw new ConflictException('تم التسجيل مسبقًا بهذا الرقم');
      }
      throw error;
    }
  }

  async findAll(page?: number, limit?: number, order?: 'asc' | 'desc') {
    const pages = page && page > 0 ? page : 1;
    const limits = limit && limit > 0 ? limit : 10;
    const orders = order === 'asc' ? 'asc' : 'desc';

    const skip = (pages - 1) * limits;

    const [leads, total] = await this.prisma.$transaction([
      this.prisma.lead.findMany({
        skip,
        take: parseFloat(limits.toString()),
        orderBy: {
          createdAt: orders,
        },
        include: {
          submission: true,
        },
      }),
      this.prisma.lead.count(),
    ]);

    return {
      data: leads,
      meta: {
        total,
        pages,
        lastPage: Math.ceil(total / limits),
      },
    };
  }

  async exportLeadsToExcelOrCSV(reply: FastifyReply, exporter: string) {
    const leads = await this.prisma.lead.findMany({
      select: {
        name: true,
        job: true,
        phone: true,
        status: true,
      },
    });

    const worksheet = XLSX.utils.json_to_sheet(leads);

    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Leads');

    if (exporter === ExportFileExtension.CSV) {
      const csv = XLSX.utils.sheet_to_csv(worksheet);

      return reply
        .header('Content-Type', 'text/csv; charset=utf-8')
        .header('Content-Disposition', 'attachment; filename="leads.csv"')
        .send(Buffer.from('\uFEFF' + csv, 'utf8'));
    }

    const buffer = XLSX.write(workbook, {
      type: 'buffer',
      bookType: 'xlsx',
    });

    return reply
      .header(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      )
      .header('Content-Disposition', 'attachment; filename="leads.xlsx"')
      .send(buffer);
  }

  async updateStatus(reply: FastifyReply, updateStatusDto: UpdateStatusDto) {
    const { id, status } = updateStatusDto;

    const lead = await this.prisma.lead.findUnique({
      where: {
        id,
      },
    });

    if (!lead) {
      throw new NotFoundException('Lead not found');
    }

    const updatedLead = await this.prisma.lead.update({
      where: {
        id,
      },
      data: {
        status: status as LeadStatus,
      },
    });

    const getLeads = await this.prisma.lead.findMany({});

    await this.redis.del('leads');
    await this.redis.set('leads', JSON.stringify(getLeads));

    return {
      status: 'success',
      data: updatedLead,
    };
  }
}
