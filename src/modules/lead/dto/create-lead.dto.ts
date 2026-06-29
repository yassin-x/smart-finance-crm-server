import {
  IsNotEmpty,
  IsPhoneNumber,
  IsString,
} from 'class-validator';

export class CreateLeadDto {
  @IsNotEmpty({ message: 'الاسم مطلوب' })
  @IsString({ message: 'الاسم يجب أن يكون نص' })
  name!: string;

  @IsNotEmpty({ message: 'الوظيفة مطلوبة' })
  @IsString({ message: 'الوظيفة يجب أن تكون نص' })
  job!: string;

  @IsNotEmpty({ message: 'رقم الهاتف مطلوب' })
  @IsPhoneNumber('EG', { message: 'رقم الهاتف غير صالح (مصري فقط)' })
  phone!: string;

  @IsNotEmpty({ message: 'templateSlug مطلوب' })
  @IsString({ message: 'templateSlug يجب أن يكون نص' })
  templateSlug!: string;

  @IsNotEmpty({ message: 'answers مطلوب' })
  answers!: Record<string, any>[];
}
