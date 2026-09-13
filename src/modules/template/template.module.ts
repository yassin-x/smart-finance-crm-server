import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module.js';
import { TemplateController } from './template.controller.js';
import { TemplateService } from './template.service.js';


@Module({
  imports: [AuthModule],
  controllers: [TemplateController],
  providers: [TemplateService],
})
export class TemplateModule {}
