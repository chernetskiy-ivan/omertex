import { ExtractJwt, Strategy } from 'passport-jwt';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TokenService } from '../token/token.service';
import { Token } from '../token/schemas/token.schema';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private readonly tokenService: TokenService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: true,
      secretOrKey: configService.get<string>('JWT_SECRET'),
      passReqToCallback: true,
    });
  }

  async validate(req): Promise<any> {
    const token = req.headers.authorization.slice(7);
    const foundToken: Token = await this.tokenService.findTokenByName(token);
    if (foundToken) {
      if (this.tokenService.canUpdateTimeLive(foundToken)) {
        await this.tokenService.updateTokenDateByName(foundToken.token);
        return { user_id: foundToken.owner };
      }
    }
    throw new UnauthorizedException();
  }
}
