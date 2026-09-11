import { IsIn } from 'class-validator';

export class CreateVoteDto {
  @IsIn(['prices', 'news', 'insight', 'meme'])
  section: string;

  @IsIn([1, -1])
  value: number;
}
