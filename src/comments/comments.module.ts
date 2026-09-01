import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CommentsController } from './comments.controller';
import { CommentsService } from './comments.service';

import { Comment } from './entities/comment.entity';
import { CommentDeletionRequest } from './entities/comment-deletion-request.entity';

import { Post } from '../posts/entities/post.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Comment, CommentDeletionRequest, Post])],

  controllers: [CommentsController],

  providers: [CommentsService],

  exports: [CommentsService],
})
export class CommentsModule {}
