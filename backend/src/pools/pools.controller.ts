import { Controller, Get, Post, Patch, Body, Param, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AdminGuard } from '../auth/admin.guard';
import { PoolsService } from './pools.service';
import { CreatePoolDto } from './dto/create-pool.dto';
import { TopUpPoolDto } from './dto/topup-pool.dto';

@Controller('admin/pools')
@UseGuards(AuthGuard('jwt'), AdminGuard)
export class PoolsController {
  constructor(private readonly poolsService: PoolsService) {}

  @Get()
  async findAll() {
    return this.poolsService.findAll();
  }

  @Get('stats')
  async getStats() {
    return this.poolsService.getStats();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.poolsService.findOne(id);
  }

  @Post()
  async create(@Body() createPoolDto: CreatePoolDto) {
    return this.poolsService.create(createPoolDto);
  }

  @Patch(':id/topup')
  async topUp(@Param('id') id: string, @Body() topUpDto: TopUpPoolDto) {
    return this.poolsService.topUp(id, topUpDto.addedGrams);
  }
}

