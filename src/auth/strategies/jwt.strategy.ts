import { Injectable, UnauthorizedException } from '@nestjs/common';

import { PassportStrategy } from '@nestjs/passport';

import { ExtractJwt, Strategy } from 'passport-jwt';

import type { Request } from 'express';

import { ConfigService } from '@nestjs/config';

import { UsersService } from '../../users/users.service';

import { UserStatus } from '../../users/enums/user-status.enum';

interface JwtPayload {
  sub: string;
  email: string;
  role: string;
}

type RequestWithCookies = Request & {
  cookies: Record<string, string | undefined>;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly usersService: UsersService,
    configService: ConfigService,
  ) {
    const secret = configService.get<string>('JWT_SECRET');

    if (!secret) {
      throw new Error('JWT_SECRET is not configured.');
    }

    const cookieName =
      configService.get<string>('COOKIE_NAME') ?? 'access_token';

    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request): string | null => {
          const requestWithCookies = request as RequestWithCookies;

          return requestWithCookies.cookies[cookieName] ?? null;
        },
      ]),

      ignoreExpiration: false,

      secretOrKey: secret,
    });
  }

  async validate(payload: JwtPayload) {
    const user = await this.usersService.findById(payload.sub);

    if (!user) {
      throw new UnauthorizedException('User not found.');
    }

    if (user.status === UserStatus.INACTIVE) {
      throw new UnauthorizedException('User account is inactive.');
    }

    return user;
  }
}
