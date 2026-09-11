import { Body, Controller, Patch, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import type { AuthenticatedUser } from '../auth/current-user.decorator';
import { UsersService } from './users.service';
import { UpdatePreferencesDto } from './dto/update-preferences.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Patch('me/preferences')
  async updatePreferences(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Body() dto: UpdatePreferencesDto,
  ) {
    const user = await this.usersService.updatePreferences(currentUser.id, dto);
    return {
      id: user._id,
      email: user.email,
      name: user.name,
      hasOnboarded: user.hasOnboarded,
      preferences: user.preferences,
    };
  }
}
