import { Body, Controller, HttpCode, HttpStatus, Post, Req, Res } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { Public } from '../../common/decorators/public.decorator';

const REFRESH_COOKIE = 'finpilot_refresh_token';
const REFRESH_COOKIE_OPTS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/api/v1/auth',
};

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  @ApiOperation({ summary: 'Create a new account' })
  async register(@Body() dto: RegisterDto, @Res({ passthrough: true }) res: Response) {
    const { auth, refreshToken } = await this.authService.register(dto);
    res.cookie(REFRESH_COOKIE, refreshToken, REFRESH_COOKIE_OPTS);
    return auth;
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Log in with email and password' })
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const { auth, refreshToken } = await this.authService.login(dto);
    res.cookie(REFRESH_COOKIE, refreshToken, REFRESH_COOKIE_OPTS);
    return auth;
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Rotate the access token using the refresh cookie' })
  async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const token = req.cookies?.[REFRESH_COOKIE];
    const { auth, refreshToken } = await this.authService.refresh(token);
    res.cookie(REFRESH_COOKIE, refreshToken, REFRESH_COOKIE_OPTS);
    return auth;
  }

  @Public()
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Revoke the current refresh token' })
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const token = req.cookies?.[REFRESH_COOKIE];
    if (token) await this.authService.logout(token);
    res.clearCookie(REFRESH_COOKIE, { path: '/api/v1/auth' });
    return { message: 'Logged out.' };
  }
}
