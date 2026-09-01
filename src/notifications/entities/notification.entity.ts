import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';

export enum NotificationType {
  POST_DELETED = 'POST_DELETED',
  COMMENT_DELETED = 'COMMENT_DELETED',
  ACCOUNT_DEACTIVATED = 'ACCOUNT_DEACTIVATED',
  ACCOUNT_ACTIVATED = 'ACCOUNT_ACTIVATED',
  COMMENT_DELETE_APPROVED = 'COMMENT_DELETE_APPROVED',
  COMMENT_DELETE_REJECTED = 'COMMENT_DELETE_REJECTED',
}

@Entity('notifications')
@Index(['userId', 'createdAt'])
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @Column('uuid')
  userId!: string;

  @Column({
    type: 'enum',
    enum: NotificationType,
  })
  type!: NotificationType;

  @Column({ length: 255 })
  title!: string;

  @Column({
    type: 'text',
  })
  message!: string;

  @Column({
    default: false,
  })
  isRead!: boolean;

  @Column({
    type: 'jsonb',
    nullable: true,
  })
  metadata!: Record<string, unknown> | null;

  @CreateDateColumn()
  createdAt!: Date;
}
