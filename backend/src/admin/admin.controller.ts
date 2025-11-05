import { Controller, Get, Post, Patch, Param, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AdminGuard } from '../auth/admin.guard';
import { AdminService } from './admin.service';

@Controller('admin')
@UseGuards(AuthGuard('jwt'), AdminGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('payouts/pending')
  async getPendingPayouts() {
    return this.adminService.getPendingPayouts();
  }

  @Get('payouts')
  async getAllPayouts() {
    return this.adminService.getAllPayouts();
  }

  @Post('payouts/:id/approve')
  async approvePayout(@Param('id') id: string) {
    return this.adminService.approvePayout(id);
  }

  @Post('payouts/:id/reject')
  async rejectPayout(@Param('id') id: string) {
    return this.adminService.rejectPayout(id);
  }

  @Get('transactions')
  async getAllTransactions() {
    return this.adminService.getAllTransactions();
  }

  @Get('users')
  async getAllUsers() {
    return this.adminService.getAllUsers();
  }
}

