import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { Comment } from './entities/comment.entity';

import {
  CommentDeletionRequest,
  CommentDeletionRequestStatus,
} from './entities/comment-deletion-request.entity';

import { Post } from '../posts/entities/post.entity';
import { User } from '../users/entities/user.entity';

import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { CommentPaginationDto } from './dto/comment-pagination.dto';
@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment)
    private readonly commentsRepository: Repository<Comment>,

    @InjectRepository(Post)
    private readonly postsRepository: Repository<Post>,

    @InjectRepository(CommentDeletionRequest)
    private readonly deletionRequestsRepository: Repository<CommentDeletionRequest>,
  ) {}

  async create(
    postId: string,
    user: User,
    dto: CreateCommentDto,
  ): Promise<Comment> {
    const post = await this.postsRepository.findOne({
      where: { id: postId },
    });

    if (!post) {
      throw new NotFoundException('Post not found.');
    }

    const comment = this.commentsRepository.create({
      postId,
      authorId: user.id,
      content: dto.content.trim(),
    });

    return this.commentsRepository.save(comment);
  }

  async findByPost(postId: string, pagination: CommentPaginationDto) {
    const post = await this.postsRepository.findOne({
      where: { id: postId },
    });

    if (!post) {
      throw new NotFoundException('Post not found.');
    }

    const { page, limit } = pagination;

    const skip = (page - 1) * limit;

    const [data, total] = await this.commentsRepository.findAndCount({
      where: {
        postId,
      },

      relations: {
        author: true,
      },

      order: {
        createdAt: 'DESC',
      },

      skip,
      take: limit,
    });

    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findById(id: string): Promise<Comment> {
    const comment = await this.commentsRepository.findOne({
      where: { id },

      relations: {
        author: true,
        post: true,
      },
    });

    if (!comment) {
      throw new NotFoundException('Comment not found.');
    }

    return comment;
  }

  async update(
    id: string,
    user: User,
    dto: UpdateCommentDto,
  ): Promise<Comment> {
    const comment = await this.findById(id);

    if (comment.authorId !== user.id) {
      throw new ForbiddenException('You can only update your own comments.');
    }

    comment.content = dto.content.trim();

    return this.commentsRepository.save(comment);
  }

  async remove(id: string, user: User): Promise<void> {
    const comment = await this.findById(id);

    if (comment.authorId !== user.id) {
      throw new ForbiddenException(
        'You cannot directly delete this comment. Submit a deletion request instead.',
      );
    }

    /*
     * IMPORTANT:
     * We intentionally do NOT allow direct
     * comment deletion here.
     *
     * The real deletion workflow will be:
     *
     * User → deletion request → Admin
     *
     * This method will therefore not be
     * exposed by the controller.
     */
    throw new ForbiddenException(
      'Comment deletion requires an administrator-approved deletion request.',
    );
  }

  async createDeletionRequest(
    userId: string,
    commentId: string,
    reason?: string,
  ): Promise<CommentDeletionRequest> {
    const comment = await this.commentsRepository.findOne({
      where: {
        id: commentId,
      },
    });

    if (!comment) {
      throw new NotFoundException('Comment not found.');
    }

    if (comment.authorId !== userId) {
      throw new ForbiddenException(
        'You can only request deletion of your own comments.',
      );
    }

    const existingRequest = await this.deletionRequestsRepository.findOne({
      where: {
        commentId,
        requestedBy: userId,
        status: CommentDeletionRequestStatus.PENDING,
      },
    });

    if (existingRequest) {
      throw new ConflictException(
        'A deletion request for this comment is already pending.',
      );
    }

    const request = this.deletionRequestsRepository.create({
      commentId,
      requestedBy: userId,
      status: CommentDeletionRequestStatus.PENDING,
      reason: reason?.trim() || null,
    });

    return this.deletionRequestsRepository.save(request);
  }
}
