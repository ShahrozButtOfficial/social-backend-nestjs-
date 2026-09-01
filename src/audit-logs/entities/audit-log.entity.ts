import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';

export enum AuditAction {
  USER_ACTIVATED = 'USER_ACTIVATED',
  USER_DEACTIVATED = 'USER_DEACTIVATED',
  USER_DELETED = 'USER_DELETED',
  POST_DELETED = 'POST_DELETED',
  COMMENT_DELETED = 'COMMENT_DELETED',
  COMMENT_DELETE_APPROVED = 'COMMENT_DELETE_APPROVED',
  COMMENT_DELETE_REJECTED = 'COMMENT_DELETE_REJECTED',
}

export enum AuditEntityType {
  USER = 'USER',
  POST = 'POST',
  COMMENT = 'COMMENT',
  COMMENT_DELETION_REQUEST = 'COMMENT_DELETION_REQUEST',
}

@Entity('audit_logs')
@Index(['adminId', 'createdAt'])
@Index(['entityType', 'entityId'])
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('uuid')
  adminId!: string;

  @Column({
    type: 'enum',
    enum: AuditAction,
  })
  action!: AuditAction;

  @Column({
    type: 'enum',
    enum: AuditEntityType,
  })
  entityType!: AuditEntityType;

  @Column('uuid')
  entityId!: string;

  @Column({
    type: 'text',
    nullable: true,
  })
  reason!: string | null;

  @Column({
    type: 'jsonb',
    nullable: true,
  })
  metadata!: Record<string, unknown> | null;

  @CreateDateColumn()
  createdAt!: Date;
}
