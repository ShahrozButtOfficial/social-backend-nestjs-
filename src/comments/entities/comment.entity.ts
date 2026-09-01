import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { User } from '../../users/entities/user.entity';
import { Post } from '../../posts/entities/post.entity';

@Entity('comments')
@Index(['postId', 'createdAt'])
@Index(['authorId', 'createdAt'])
export class Comment {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @Column('uuid')
  postId!: string;

  @Index()
  @Column('uuid')
  authorId!: string;

  @Column({
    type: 'text',
  })
  content!: string;

  @ManyToOne(() => Post, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({
    name: 'postId',
  })
  post!: Post;

  @ManyToOne(() => User, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({
    name: 'authorId',
  })
  author!: User;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @DeleteDateColumn()
  deletedAt!: Date | null;
}
