import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema({ _id: false })
export class UserPreferences {
  @Prop({ type: [String], default: [] })
  assets: string[];

  @Prop({ default: '' })
  investorType: string;

  @Prop({ type: [String], default: [] })
  contentTypes: string[];
}

export const UserPreferencesSchema =
  SchemaFactory.createForClass(UserPreferences);

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  email: string;

  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true })
  passwordHash: string;

  @Prop({ default: false })
  hasOnboarded: boolean;

  @Prop({ type: UserPreferencesSchema, default: () => ({}) })
  preferences: UserPreferences;
}

export const UserSchema = SchemaFactory.createForClass(User);
