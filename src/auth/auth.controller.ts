import { Body, Controller, Post, Res } from '@nestjs/common';

import type { Response } from 'express';

import { AuthService } from './auth.service';

import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';

import { VerifyEmailDto } from './dto/verify-email.dto';

import { ResendOtpDto } from './dto/resend-otp.dto';

import { ForgotPasswordDto } from './dto/forgot-password.dto';

import { ResetPasswordDto } from './dto/reset-password.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  async signup(@Body() dto: SignupDto) {
    return this.authService.signup(dto);
  }

  @Post('verify-email')
  async verifyEmail(@Body() dto: VerifyEmailDto) {
    return this.authService.verifyEmail(dto);
  }

  @Post('resend-otp')
  async resendOtp(@Body() dto: ResendOtpDto) {
    return this.authService.resendOtp(dto);
  }

  @Post('login')
  async login(
    @Body() dto: LoginDto,
    @Res({
      passthrough: true,
    })
    response: Response,
  ) {
    const result = await this.authService.login(dto);

    response.cookie(
      process.env.COOKIE_NAME ?? 'access_token',
      result.accessToken,
      {
        httpOnly: true,

        secure: process.env.NODE_ENV === 'production',

        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',

        maxAge: 15 * 60 * 1000,

        path: '/',
      },
    );

    return {
      message: 'Login successful.',
      user: result.user,
    };
  }

  @Post('logout')
  logout(
    @Res({ passthrough: true })
    response: Response,
  ) {
    response.clearCookie(process.env.COOKIE_NAME ?? 'access_token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      path: '/',
    });

    return {
      message: 'Logout successful.',
    };
  }

  @Post('forgot-password')
  async forgotPassword(
    @Body()
    dto: ForgotPasswordDto,
  ) {
    return this.authService.forgotPassword(dto);
  }

  @Post('reset-password')
  async resetPassword(
    @Body()
    dto: ResetPasswordDto,
  ) {
    return this.authService.resetPassword(dto);
  }
}
