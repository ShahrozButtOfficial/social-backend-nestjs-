import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { LikeTargetType } from '../enums/like-target-type.enum';

@Entity('likes')
@Index(['userId', 'targetId', 'targetType'], {
  unique: true,
})
@Index(['targetId', 'targetType'])
export class Like {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('uuid')
  userId!: string;

  @Column('uuid')
  targetId!: string;

  @Column({
    type: 'enum',
    enum: LikeTargetType,
  })
  targetType!: LikeTargetType;

  @CreateDateColumn()
  createdAt!: Date;
}
