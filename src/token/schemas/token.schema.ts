import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type TokenDocument = Token & Document;

@Schema()
export class Token {
  @Prop({ required: true, unique: false })
  owner: string;

  @Prop({ required: true })
  date: number;

  @Prop({ required: true, unique: true })
  token: string;
}

export const TokenSchema = SchemaFactory.createForClass(Token);
