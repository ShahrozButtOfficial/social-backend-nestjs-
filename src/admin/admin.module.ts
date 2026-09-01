import { Module } from '@nestjs/common';

import { TypeOrmModule } from '@nestjs/typeorm';

import { User } from '../users/entities/user.entity';

import { Post } from '../posts/entities/post.entity';

import { Comment } from '../comments/entities/comment.entity';

import { CommentDeletionRequest } from '../comments/entities/comment-deletion-request.entity';

import { NotificationsModule } from '../notifications/notifications.module';

import { AuditLogsModule } from '../audit-logs/audit-logs.module';

import { AdminController } from './admin.controller';

import { AdminService } from './admin.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Post, Comment, CommentDeletionRequest]),

    NotificationsModule,
    AuditLogsModule,
  ],

  controllers: [AdminController],

  providers: [AdminService],
})
export class AdminModule {}
