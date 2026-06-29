import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { TemplateService } from './template.service';
import { CreateTemplateDto } from './dto/create-template.dto';
import { AuthGuard } from '../auth/guards/auth.guard';
import { RoleGuard } from '../auth/guards/role.guard';

@Controller('template')
export class TemplateController {
  constructor(private readonly templateService: TemplateService) {}

  @UseGuards(AuthGuard, RoleGuard)
  @Post()
  async create(@Body() createTemplateDto: CreateTemplateDto) {
    return await this.templateService.create(createTemplateDto);
  }

  @Get()
  async findAll() {
    return await this.templateService.findAll();
  }

  @Get(':slug')
  async findOne(@Param('slug') slug: string) {
    return await this.templateService.findOne(slug);
  }
}
