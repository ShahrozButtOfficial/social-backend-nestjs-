import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post as HttpPost,
  Query,
  UseGuards,
} from '@nestjs/common';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

import { CurrentUser } from '../common/decorators/current-user.decorator';

import { User } from '../users/entities/user.entity';

import { CommentsService } from './comments.service';

import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { CommentPaginationDto } from './dto/comment-pagination.dto';
import { CreateCommentDeletionRequestDto } from './dto/create-comment-deletion-request.dto';

@Controller('comments')
@UseGuards(JwtAuthGuard)
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @HttpPost(':postId')
  create(
    @Param('postId', new ParseUUIDPipe())
    postId: string,

    @CurrentUser() user: User,

    @Body() dto: CreateCommentDto,
  ) {
    return this.commentsService.create(postId, user, dto);
  }

  @Get('post/:postId')
  findByPost(
    @Param('postId', new ParseUUIDPipe())
    postId: string,

    @Query()
    pagination: CommentPaginationDto,
  ) {
    return this.commentsService.findByPost(postId, pagination);
  }

  @Get(':id')
  findById(
    @Param('id', new ParseUUIDPipe())
    id: string,
  ) {
    return this.commentsService.findById(id);
  }

  @Patch(':id')
  update(
    @Param('id', new ParseUUIDPipe())
    id: string,

    @CurrentUser() user: User,

    @Body() dto: UpdateCommentDto,
  ) {
    return this.commentsService.update(id, user, dto);
  }

  @HttpPost(':id/deletion-request')
  createDeletionRequest(
    @Param('id', new ParseUUIDPipe())
    id: string,

    @CurrentUser() user: User,

    @Body()
    dto: CreateCommentDeletionRequestDto,
  ) {
    return this.commentsService.createDeletionRequest(user.id, id, dto.reason);
  }
}
