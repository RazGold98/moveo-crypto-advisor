import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import type { AuthenticatedUser } from '../auth/current-user.decorator';
import { UsersService } from '../users/users.service';
import { DashboardService } from './dashboard.service';

@Controller('dashboard')
export class DashboardController {
  constructor(
    private readonly dashboardService: DashboardService,
    private readonly usersService: UsersService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get('meme')
  getMeme() {
    return this.dashboardService.getMeme();
  }

  @UseGuards(JwtAuthGuard)
  @Get('insight')
  async getInsight(@CurrentUser() currentUser: AuthenticatedUser) {
    const user = await this.usersService.findById(currentUser.id);
    const preferences = user?.preferences ?? {
      assets: [],
      investorType: '',
      contentTypes: [],
    };
    const insight = await this.dashboardService.getAiInsight(preferences);
    return { insight };
  }

  @UseGuards(JwtAuthGuard)
  @Get('prices')
  getPrices(@Query('ids') ids: string) {
    const coinIds = (ids ?? 'bitcoin,ethereum').split(',');
    return this.dashboardService.getCoinPrices(coinIds);
  }
  @UseGuards(JwtAuthGuard)
  @Get('news')
  getNews() {
    return this.dashboardService.getMarketNews();
  }
  @UseGuards(JwtAuthGuard)
  @Get()
  async getDashboard(@CurrentUser() currentUser: AuthenticatedUser) {
    const user = await this.usersService.findById(currentUser.id);
    const preferences = user?.preferences ?? {
      assets: [],
      investorType: '',
      contentTypes: [],
    };
    return this.dashboardService.getDashboard(preferences);
  }
}
