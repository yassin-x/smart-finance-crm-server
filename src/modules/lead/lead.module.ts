import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module.js';
import { LeadController } from './lead.controller.js';
import { LeadService } from './lead.service.js';

@Module({
  imports: [AuthModule],
  controllers: [LeadController],
  providers: [LeadService],
})
export class LeadModule {}
