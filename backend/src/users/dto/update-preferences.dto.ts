import { ArrayNotEmpty, IsArray, IsIn, IsString } from 'class-validator';

export class UpdatePreferencesDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  assets: string[];

  @IsIn(['HODLer', 'Day Trader', 'NFT Collector'])
  investorType: string;

  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  contentTypes: string[];
}
