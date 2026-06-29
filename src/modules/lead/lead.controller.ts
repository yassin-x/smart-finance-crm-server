import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { LeadService } from './lead.service';
import { CreateLeadDto } from './dto/create-lead.dto';
import { AuthGuard } from '../auth/guards/auth.guard';

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
}
