import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Token, TokenDocument } from './schemas/token.schema';
import { TokenPayloadDto } from './dto/TokenPayload.dto';

@Injectable()
export class TokenService {
  constructor(
    @InjectModel(Token.name) private tokenModel: Model<TokenDocument>,
  ) {}

  async create(payload: TokenPayloadDto): Promise<Token> {
    const createdToken = new this.tokenModel(payload);
    return createdToken.save();
  }

  async findTokensByUserId(userId: string): Promise<Token[]> {
    return await this.tokenModel.find({ owner: userId }).exec();
  }

  async findTokenByName(tokenName: string): Promise<Token> {
    return await this.tokenModel.findOne({ token: tokenName }).exec();
  }

  canUpdateTimeLive(token: Token): boolean {
    return Date.now() - 5 * 1000 * 60 < token.date;
  }

  async findTokenByDate(date: number): Promise<Token> {
    return await this.tokenModel.findOne({ date }).exec();
  }

  async findYoungestToken(userId: string): Promise<Token> {
    const tokens: Token[] = await this.findTokensByUserId(userId);
    let youngestDate: number = Date.now() - 1000 * 60 * 5;
    tokens.forEach((token: Token) => {
      if (youngestDate <= token.date) {
        youngestDate = token.date;
      }
    });
    return this.findTokenByDate(youngestDate);
  }

  async updateTokenDateByName(tokenName: string): Promise<void> {
    await this.tokenModel
      .updateOne({ token: tokenName }, { date: Date.now() + 5 * 1000 * 60 })
      .exec();
  }

  async deleteTokensByUserId(userId: string): Promise<any> {
    await this.tokenModel.deleteMany({ owner: userId }).exec();
  }

  async deleteCurrentTokenByUserId(userId: string): Promise<any> {
    const currentToken: Token = await this.findYoungestToken(userId);
    await this.tokenModel.deleteOne({ token: currentToken.token }).exec();
  }
}
