import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [HttpModule, UsersModule],
  providers: [DashboardService],
  controllers: [DashboardController],
})
export class DashboardModule {}
