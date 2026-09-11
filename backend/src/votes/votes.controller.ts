import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import type { AuthenticatedUser } from '../auth/current-user.decorator';
import { VotesService } from './votes.service';
import { CreateVoteDto } from './dto/create-vote.dto';

@Controller('votes')
export class VotesController {
  constructor(private readonly votesService: VotesService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  vote(@CurrentUser() user: AuthenticatedUser, @Body() dto: CreateVoteDto) {
    return this.votesService.vote(user.id, dto.section, dto.value);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  myVotes(@CurrentUser() user: AuthenticatedUser) {
    return this.votesService.getUserVotes(user.id);
  }
}
