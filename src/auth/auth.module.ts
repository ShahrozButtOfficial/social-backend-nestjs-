import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { Otp } from './entities/otp.entity';
import { JwtStrategy } from './strategies/jwt.strategy';

import { UsersModule } from '../users/users.module';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Otp]),

    PassportModule,

    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],

      useFactory: (configService: ConfigService) => {
        const secret = configService.get<string>('JWT_SECRET');

        if (!secret) {
          throw new Error('JWT_SECRET is not configured.');
        }

        return {
          secret,
          signOptions: {
            expiresIn: '15m',
          },
        };
      },
    }),

    UsersModule,
    EmailModule,
  ],

  controllers: [AuthController],

  providers: [AuthService, JwtStrategy],

  exports: [AuthService, JwtStrategy],
})
export class AuthModule {}
