import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { Comment } from './comment.entity';

import { User } from '../../users/entities/user.entity';

export enum CommentDeletionRequestStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

@Entity('comment_deletion_requests')
@Index(['commentId', 'status'])
export class CommentDeletionRequest {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('uuid')
  commentId!: string;

  @Column('uuid')
  requestedBy!: string;

  @Column('uuid', {
    nullable: true,
  })
  reviewedBy!: string | null;

  @Column({
    type: 'enum',
    enum: CommentDeletionRequestStatus,
    default: CommentDeletionRequestStatus.PENDING,
  })
  status!: CommentDeletionRequestStatus;

  @Column({
    type: 'text',
    nullable: true,
  })
  reason!: string | null;

  @Column({
    type: 'timestamp',
    nullable: true,
  })
  reviewedAt!: Date | null;

  @CreateDateColumn()
  createdAt!: Date;

  @ManyToOne(() => Comment, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({
    name: 'commentId',
  })
  comment!: Comment;

  @ManyToOne(() => User, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({
    name: 'requestedBy',
  })
  requester!: User;
}
