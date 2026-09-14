import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module.js';
import { LeadController } from './lead.controller.js';
import { LeadService } from './lead.service.js';
import { HttpModule } from '@nestjs/axios';
import { MetaService } from './stratgies/meta.service.js';

@Module({
  imports: [AuthModule, HttpModule],
  controllers: [LeadController],
  providers: [LeadService, MetaService],
})
export class LeadModule {}
