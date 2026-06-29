import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateLeadDto } from './dto/create-lead.dto';
import { PrismaService } from '../prisma/prisma.service';
import { InjectRedis } from '../redis/decorator/redis.decorator';
import Redis from 'ioredis';

@Injectable()
export class LeadService {
  constructor(
    private prisma: PrismaService,
    @InjectRedis() private redis: Redis,
  ) {}

  async create(createLeadDto: CreateLeadDto) {
    const phoneExited = await this.prisma.lead.findUnique({
      where: {
        phone: createLeadDto.phone,
      },
    });
    if (phoneExited) {
      throw new ConflictException('تم التسجيل مسبقًا بهذا الرقم');
    }
    const oldLeads = await this.prisma.phoneRegistry.findUnique({
      where: {
        phoneNumber: createLeadDto.phone,
      },
    });
    if (oldLeads) {
      throw new ConflictException('تم التسجيل مسبقًا بهذا الرقم');
    }

    try {
      const result = await this.prisma.$transaction(async (tx) => {
        const submission = await tx.submission.create({
          data: {
            formTemplateSlug: createLeadDto.templateSlug,
            answers: createLeadDto.answers,
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
        take: limits,
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
}
