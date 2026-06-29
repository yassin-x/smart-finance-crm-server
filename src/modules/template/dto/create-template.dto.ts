import { FieldType } from '@prisma/client';
import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsJSON,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateTemplateDto {
  @IsString({ message: 'يجب أن يكون العنوان حروف' })
  title!: string;

  @IsString({ message: 'يجب أن يكون الوصف حروف' })
  desc!: string;

  @IsString({ message: 'يجب أن يكون العنوان حروف' })
  slug!: string;

  @IsOptional()
  @IsBoolean({ message: 'يجب أن يكون الحالة صالحة' })
  isActive?: boolean;

  @IsOptional()
  @IsObject({ message: 'يجب أن يكون القواعد Object' })
  rules?: Record<string, any>;

  @IsArray({ message: 'يجب أن يكون الأسئلة مصفوفة' })
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateQuestionDto)
  questions!: CreateQuestionDto[];
}

export class CreateQuestionDto {
  @IsString({ message: 'يجب أن يكون العنوان حروف' })
  label!: string;

  @IsString({ message: 'يجب أن يكون الوصف حروف' })
  desc!: string;

  @IsString({ message: 'يجب أن يكون الاسم حروف' })
  name!: string;

  @IsEnum(FieldType, { message: 'يجب ان يكون النوع من ضمن الاخيتارات' })
  type!: FieldType;

  @IsOptional()
  @IsString({ message: 'يجب أن يكون حروف' })
  placeholder?: string;

  @IsOptional()
  @IsBoolean({ message: 'يجب أن يكون الحالة صالحة' })
  required?: boolean;

  @IsOptional()
  @IsObject({ message: 'يجب أن يكون القواعد Object' })
  rules?: Record<string, any>;

  @IsInt({ message: 'يجب أن يكون الرقم صالح' })
  order!: number;
}
