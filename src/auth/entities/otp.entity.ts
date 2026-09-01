import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';

export enum OtpType {
  EMAIL_VERIFICATION = 'EMAIL_VERIFICATION',
  PASSWORD_RESET = 'PASSWORD_RESET',
}

@Entity('otps')
export class Otp {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @Column()
  userId!: string;

  @Column({
    type: 'enum',
    enum: OtpType,
  })
  type!: OtpType;

  @Column()
  codeHash!: string;

  @Column()
  expiresAt!: Date;

  @Column({
    default: 0,
  })
  attempts!: number;

  @Column({
    type: 'timestamp',
    nullable: true,
  })
  verifiedAt!: Date | null;

  @CreateDateColumn()
  createdAt!: Date;
}
