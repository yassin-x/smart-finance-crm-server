import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateTemplateDto } from './dto/create-template.dto';
import { FieldType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { InjectRedis } from '../redis/decorator/redis.decorator';
import Redis from 'ioredis';

@Injectable()
export class TemplateService {
  constructor(
    private prisma: PrismaService,
    @InjectRedis() private readonly redis: Redis,
  ) {}

  async create(createTemplateDto: CreateTemplateDto) {
    const { questions, ...templateData } = createTemplateDto;
    const names = new Set<string>();
    const orders = new Set<number>();

    for (const q of questions) {
      if (names.has(q.name)) {
        throw new BadRequestException(`الاسم مكرر: ${q.name}`);
      }
      names.add(q.name);

      if (orders.has(q.order)) {
        throw new BadRequestException(`الترتيب مكرر: ${q.order}`);
      }
      orders.add(q.order);
    }

    for (const q of questions) {
      const rules = q.rules;

      switch (q.type) {
        case FieldType.NUMBER: {
          const min = rules?.min;
          const max = rules?.max;

          if (min !== undefined && typeof min !== 'number') {
            throw new BadRequestException(
              `الحد الادنى يجب ان يكون رقم ${q.name}`,
            );
          }

          if (max !== undefined && typeof max !== 'number') {
            throw new BadRequestException(
              `الحد الاعلى يجب ان يكون رقم ${q.name}`,
            );
          }

          if (min !== undefined && max !== undefined && min > max) {
            throw new BadRequestException(
              `الحد الادنى يجب ان يكون اقل من الحد الاعلى ${q.name}`,
            );
          }

          break;
        }
      }
    }
    let template;

    try {
      template = await this.prisma.formTemplate.create({
        data: {
          ...templateData,
          questions: {
            create: questions.map((q) => ({
              label: q.label,
              desc: q.desc,
              name: q.name,
              type: q.type,
              placeholder: q.placeholder,
              required: q.required ?? false,
              order: q.order,
              rules: q.rules ?? {},
            })),
          },
        },
        include: {
          questions: true,
        },
      });
    } catch (error: any) {
      if (error.code === 'P2002') {
        throw new BadRequestException('فيه بيانات مكررة (unique constraint)');
      }

      throw new BadRequestException(error.message || 'Database error');
    }

    return {
      message: 'تم انشاء القالب بنجاح',
      data: {
        ...template,
      },
    };
  }

  async findAll() {
    const cashed = await this.redis.get('templates');
    if (cashed) {
      return {
        message: 'تم الحصول على القالب بنجاح',
        data: {
          templates: JSON.parse(cashed),
        },
        source: 'cache',
      };
    }

    const templates = await this.prisma.formTemplate.findMany({
      include: {
        questions: true,
      },
    });

    await this.redis.set(
      'templates',
      JSON.stringify(templates),
      'EX',
      60 * 60 * 24,
    );

    return {
      message: 'تم الحصول على القالب بنجاح',
      data: {
        templates,
      },
    };
  }

  async findOne(slug: string) {
    const template = await this.prisma.formTemplate.findUnique({
      where: {
        slug,
      },
      include: {
        questions: true,
      },
    });

    if (!template) {
      throw new BadRequestException('القالب غير موجود');
    }

    const normalizedQuestions = template.questions.map((q) => ({
      ...q,
      type: q.type?.toLowerCase(),
    }));

    return {
      message: 'تم الحصول على القالب بنجاح',
      data: {
        ...template,
        questions: normalizedQuestions,
      },
    };
  }
}
