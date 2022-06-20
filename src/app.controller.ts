import {
  Controller,
  Get,
  UseGuards,
  Request,
  Post,
  Body,
  Query,
} from '@nestjs/common';
import { AppService } from './app.service';
import { UserService } from './user/user.service';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { AuthService } from './auth/auth.service';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { FULL_ENUM } from './user/enums/full.enum';
import { UserPayloadDto } from './auth/dto/UserPayload.dto';

@ApiTags('API')
@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly userService: UserService,
    private readonly authService: AuthService,
  ) {}

  @Post('/signup')
  @ApiBadRequestResponse({ description: 'Invalid data request' })
  @ApiOkResponse({ description: 'The user has been created' })
  @ApiBody({ type: UserPayloadDto })
  async signUp(@Body() payload: UserPayloadDto): Promise<any> {
    return this.authService.signUp(payload);
  }

  @Post('/login')
  @ApiBadRequestResponse({ description: 'Invalid data request' })
  @ApiOkResponse({ description: 'You login' })
  @ApiBody({ type: UserPayloadDto })
  async login(@Body() payload: UserPayloadDto): Promise<string> {
    return this.authService.login(payload);
  }

  @Get('/logout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiUnauthorizedResponse({ description: 'Unauthorized, please login' })
  @ApiOkResponse({ description: 'Remove token(s)' })
  @ApiQuery({ name: 'full', enum: FULL_ENUM })
  async logout(@Query('full') full: string, @Request() req): Promise<void> {
    return this.authService.logout({ full, user_id: req.user.user_id });
  }

  @Get('/info')
  @ApiBearerAuth('JWT-auth')
  @ApiUnauthorizedResponse({ description: 'Unauthorized, please login' })
  @ApiOkResponse({ description: 'Get info about user' })
  @UseGuards(JwtAuthGuard)
  async info(@Request() req): Promise<any> {
    return this.userService.info(String(req.user.user_id));
  }

  @Get('/latency')
  @ApiBearerAuth('JWT-auth')
  @ApiUnauthorizedResponse({ description: 'Unauthorized, please login' })
  @ApiOkResponse({ description: 'Get latency for google.com' })
  @UseGuards(JwtAuthGuard)
  async latency(@Request() req): Promise<number> {
    return this.userService.latency();
  }
}
