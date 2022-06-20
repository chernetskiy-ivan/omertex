import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { UserService } from '../user/user.service';
import { User } from '../user/schemas/user.schema';
import { TokenService } from '../token/token.service';
import { FULL_ENUM } from '../user/enums/full.enum';
import { UserPayloadDto } from './dto/UserPayload.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
    private readonly tokenService: TokenService,
  ) {}

  async signUp(payload: UserPayloadDto): Promise<any> {
    if (
      payload.user_id &&
      payload.password &&
      this.userService.isEmailOrPhone(payload.user_id)
    ) {
      const sameUser = await this.userService.findByUserId(payload.user_id);

      if (!sameUser) {
        const hashPassword: string = await bcrypt.hash(payload.password, 8);
        const newUser: User = await this.userService.create({
          ...payload,
          password: hashPassword,
        });
        if (newUser) {
          const token: string = this.generateToken(payload.user_id);
          await this.tokenService.create({
            owner: newUser.user_id,
            date: Date.now(),
            token,
          });
          return {
            bearer: token,
          };
        }
      }
    }
    throw new BadRequestException();
  }

  async login(payload: UserPayloadDto): Promise<any> {
    if (payload.user_id && payload.password) {
      if (await this.userService.isUser(payload)) {
        const token: string = this.generateToken(payload.user_id);
        await this.tokenService.create({
          owner: payload.user_id,
          date: Date.now(),
          token,
        });
        return {
          bearer: token,
        };
      }
    }
    throw new BadRequestException();
  }

  generateToken(userId: string): string {
    return this.jwtService.sign({ user_id: userId });
  }

  async logout({ full, user_id }): Promise<void> {
    if (full === FULL_ENUM.TRUE) {
      await this.tokenService.deleteTokensByUserId(user_id);
    } else if (full === FULL_ENUM.FALSE) {
      await this.tokenService.deleteCurrentTokenByUserId(user_id);
    }
  }
}
