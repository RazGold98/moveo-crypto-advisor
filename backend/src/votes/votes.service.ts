import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Vote, VoteDocument } from './schemas/vote.schema';

@Injectable()
export class VotesService {
  constructor(
    @InjectModel(Vote.name) private readonly voteModel: Model<VoteDocument>,
  ) {}

  async vote(userId: string, section: string, value: number) {
    return this.voteModel
      .findOneAndUpdate(
        { userId, section },
        { value },
        { new: true, upsert: true },
      )
      .exec();
  }

  async getUserVotes(userId: string) {
    return this.voteModel.find({ userId }).exec();
  }
}
