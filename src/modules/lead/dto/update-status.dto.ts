import { IsEnum, IsNotEmpty } from 'class-validator';
import { LeadStatus } from '../../../generated/prisma/enums.js';

export class UpdateStatusDto {
  @IsEnum(LeadStatus, {
    message:
      'Invalid status. Allowed values are NEW, CONTACTED, AFTER, REJECTED, ACEPTED, QUALIFIED.',
  })
  status: string;

  @IsNotEmpty()
  id: string;
}
