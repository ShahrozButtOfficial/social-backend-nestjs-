import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import * as bcrypt from 'bcrypt';
import { randomInt } from 'crypto';

import { JwtService } from '@nestjs/jwt';

import { UsersService } from '../users/users.service';
import { UserRole } from '../users/enums/user-role.enum';
import { UserStatus } from '../users/enums/user-status.enum';

import { EmailService } from '../email/email.service';

import { Otp, OtpType } from './entities/otp.entity';

import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';

import { ResendOtpDto } from './dto/resend-otp.dto';

import { ForgotPasswordDto } from './dto/forgot-password.dto';

import { ResetPasswordDto } from './dto/reset-password.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly emailService: EmailService,

    @InjectRepository(Otp)
    private readonly otpRepository: Repository<Otp>,
  ) {}

  async signup(dto: SignupDto) {
    const email = dto.email.toLowerCase().trim();

    const existingUser = await this.usersService.findByEmail(email);

    if (existingUser) {
      throw new ConflictException('An account with this email already exists.');
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);

    const user = await this.usersService.create({
      firstName: dto.firstName.trim(),
      lastName: dto.lastName.trim(),
      email,
      password: passwordHash,
      role: UserRole.USER,
      status: UserStatus.ACTIVE,
      emailVerified: false,
    });

    await this.createAndSendOtp(
      user.id,
      user.email,
      OtpType.EMAIL_VERIFICATION,
    );

    return {
      message:
        'Account created. Please verify your email using the OTP sent to your email.',
      userId: user.id,
    };
  }

  async verifyEmail(dto: VerifyEmailDto) {
    const email = dto.email.toLowerCase().trim();

    const user = await this.usersService.findByEmail(email);

    if (!user) {
      throw new UnauthorizedException('Invalid verification request.');
    }

    if (user.emailVerified) {
      return {
        message: 'Email is already verified.',
      };
    }

    await this.verifyOtp(user.id, dto.otp, OtpType.EMAIL_VERIFICATION);

    await this.usersService.update(user.id, {
      emailVerified: true,
    });

    return {
      message: 'Email verified successfully.',
    };
  }

  async resendOtp(dto: ResendOtpDto) {
    const email = dto.email.toLowerCase().trim();

    const user = await this.usersService.findByEmail(email);

    /*
     * Do not reveal whether an email
     * exists in a real production system.
     */
    if (!user) {
      return {
        message: 'If the account exists, a verification code has been sent.',
      };
    }

    if (user.emailVerified) {
      return {
        message: 'Email is already verified.',
      };
    }

    await this.createAndSendOtp(
      user.id,
      user.email,
      OtpType.EMAIL_VERIFICATION,
    );

    return {
      message: 'If the account exists, a verification code has been sent.',
    };
  }

  async login(dto: LoginDto) {
    const email = dto.email.toLowerCase().trim();

    const user = await this.usersService.findByEmail(email);

    if (!user) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    const passwordMatches = await bcrypt.compare(dto.password, user.password);

    if (!passwordMatches) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    if (user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedException('Your account is inactive.');
    }

    if (!user.emailVerified) {
      throw new UnauthorizedException(
        'Please verify your email before logging in.',
      );
    }

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = await this.jwtService.signAsync(payload);

    return {
      accessToken,
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
      },
    };
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const email = dto.email.toLowerCase().trim();

    const user = await this.usersService.findByEmail(email);

    if (!user) {
      return {
        message: 'If the account exists, a password reset code has been sent.',
      };
    }

    await this.createAndSendOtp(user.id, user.email, OtpType.PASSWORD_RESET);

    return {
      message: 'If the account exists, a password reset code has been sent.',
    };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const email = dto.email.toLowerCase().trim();

    const user = await this.usersService.findByEmail(email);

    if (!user) {
      throw new UnauthorizedException('Invalid password reset request.');
    }

    await this.verifyOtp(user.id, dto.otp, OtpType.PASSWORD_RESET);

    const passwordHash = await bcrypt.hash(dto.newPassword, 12);

    await this.usersService.update(user.id, {
      password: passwordHash,
    });

    return {
      message: 'Password reset successfully.',
    };
  }

  private generateOtp(): string {
    return randomInt(100000, 1000000).toString();
  }

  private async createAndSendOtp(userId: string, email: string, type: OtpType) {
    const cooldown = Number(process.env.OTP_RESEND_COOLDOWN_SECONDS ?? 60);

    const recentOtp = await this.otpRepository.findOne({
      where: {
        userId,
        type,
      },
      order: {
        createdAt: 'DESC',
      },
    });

    if (recentOtp) {
      const secondsSinceCreation =
        (Date.now() - recentOtp.createdAt.getTime()) / 1000;

      if (secondsSinceCreation < cooldown) {
        throw new UnauthorizedException(
          `Please wait ${Math.ceil(
            cooldown - secondsSinceCreation,
          )} seconds before requesting another OTP.`,
        );
      }
    }

    const otp = this.generateOtp();

    const codeHash = await bcrypt.hash(otp, 10);

    const expiresInMinutes = Number(process.env.OTP_EXPIRES_IN_MINUTES ?? 5);

    const expiresAt = new Date(Date.now() + expiresInMinutes * 60 * 1000);

    await this.otpRepository.save({
      userId,
      type,
      codeHash,
      expiresAt,
      attempts: 0,
      verifiedAt: null,
    });

    if (type === OtpType.EMAIL_VERIFICATION) {
      await this.emailService.sendVerificationOtp(email, otp);
    }

    if (type === OtpType.PASSWORD_RESET) {
      await this.emailService.sendPasswordResetOtp(email, otp);
    }
  }

  private async verifyOtp(userId: string, otp: string, type: OtpType) {
    const record = await this.otpRepository.findOne({
      where: {
        userId,
        type,
      },
      order: {
        createdAt: 'DESC',
      },
    });

    if (!record) {
      throw new UnauthorizedException('Invalid or expired OTP.');
    }

    if (record.verifiedAt) {
      throw new UnauthorizedException('OTP has already been used.');
    }

    if (record.expiresAt.getTime() < Date.now()) {
      throw new UnauthorizedException('OTP has expired.');
    }

    const maxAttempts = Number(process.env.OTP_MAX_ATTEMPTS ?? 5);

    if (record.attempts >= maxAttempts) {
      throw new UnauthorizedException('Too many OTP attempts.');
    }

    const matches = await bcrypt.compare(otp, record.codeHash);

    if (!matches) {
      record.attempts += 1;

      await this.otpRepository.save(record);

      throw new UnauthorizedException('Invalid or expired OTP.');
    }

    record.verifiedAt = new Date();

    await this.otpRepository.save(record);
  }
}
