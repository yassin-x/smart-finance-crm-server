import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
  Res,
} from '@nestjs/common';
import { LeadService } from './lead.service.js';
import { CreateLeadDto } from './dto/create-lead.dto.js';
import { AuthGuard } from '../auth/guards/auth.guard.js';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { UpdateStatusDto } from './dto/update-status.dto.js';

@Controller('lead')
export class LeadController {
  constructor(private readonly leadService: LeadService) {}

  @Post()
  async create(@Body() createLeadDto: CreateLeadDto) {
    return await this.leadService.create(createLeadDto);
  }

  @UseGuards(AuthGuard)
  @Get()
  async findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('order') order?: 'asc' | 'desc',
  ) {
    return await this.leadService.findAll(page, limit, order);
  }

  @UseGuards(AuthGuard)
  @Get('export')
  async exportLeadsToExcelOrCSV(
    @Res({ passthrough: true }) reply: FastifyReply,
    @Query('fileExtension') exporter: string,
  ) {
    return await this.leadService.exportLeadsToExcelOrCSV(reply, exporter);
  }

  @UseGuards(AuthGuard)
  @Post('status')
  async updateStatus(
    @Res({ passthrough: true }) reply: FastifyReply,
    @Body() updateStatusDto: UpdateStatusDto,
  ) {
    return await this.leadService.updateStatus(reply, updateStatusDto);
  }
}
