import { Body, Controller, Post, Get, UseGuards, Req, Res, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { Request, Response } from 'express';
import { AuthService, AuthResponse } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  register(@Body() dto: RegisterDto): Promise<AuthResponse> {
    return this.authService.register(dto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body() dto: LoginDto): Promise<AuthResponse> {
    return this.authService.login(dto);
  }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  googleAuth() {}

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthCallback(@Req() req: Request, @Res() res: Response) {
    const profile = req.user as { email: string; name: string };
    const authResponse = await this.authService.googleLogin(profile);
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const user = encodeURIComponent(JSON.stringify(authResponse.user));
    res.redirect(`${frontendUrl}/auth/google/callback?token=${authResponse.accessToken}&user=${user}`);
  }

  @Post('guest-login')
  @HttpCode(HttpStatus.OK)
  guestLogin(): Promise<AuthResponse> {
    return this.authService.guestLogin();
  }
}
