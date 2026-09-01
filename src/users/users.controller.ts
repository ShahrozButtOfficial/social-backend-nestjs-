import { Controller, Get, Req, UseGuards } from '@nestjs/common';

import type { Request } from 'express';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('users')
export class UsersController {
  @Get('me')
  @UseGuards(JwtAuthGuard)
  getMe(@Req() request: Request) {
    return request.user;
  }
}
