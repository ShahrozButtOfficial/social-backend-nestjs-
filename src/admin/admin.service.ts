import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { User } from '../users/entities/user.entity';

import { UserStatus } from '../users/enums/user-status.enum';

import { Post } from '../posts/entities/post.entity';

import { Comment } from '../comments/entities/comment.entity';

import {
  CommentDeletionRequest,
  CommentDeletionRequestStatus,
} from '../comments/entities/comment-deletion-request.entity';

import { NotificationType } from '../notifications/entities/notification.entity';

import { NotificationsService } from '../notifications/notifications.service';

import {
  AuditAction,
  AuditEntityType,
} from '../audit-logs/entities/audit-log.entity';

import { AuditLogsService } from '../audit-logs/audit-logs.service';

import { AdminPaginationDto } from './dto/admin-pagination.dto';

import {
  CommentDeletionDecision,
  ReviewCommentDeletionDto,
} from './dto/review-comment-deletion.dto';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,

    @InjectRepository(Post)
    private readonly postsRepository: Repository<Post>,

    @InjectRepository(Comment)
    private readonly commentsRepository: Repository<Comment>,

    @InjectRepository(CommentDeletionRequest)
    private readonly deletionRequestsRepository: Repository<CommentDeletionRequest>,

    private readonly notificationsService: NotificationsService,

    private readonly auditLogsService: AuditLogsService,
  ) {}

  async findUsers(pagination: AdminPaginationDto) {
    const { page, limit, status } = pagination;

    const where = status !== undefined ? { status } : {};

    const [data, total] = await this.usersRepository.findAndCount({
      where,

      order: {
        createdAt: 'DESC',
      },

      skip: (page - 1) * limit,

      take: limit,

      withDeleted: true,
    });

    return {
      data: data.map((user) => ({
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        status: user.status,
        emailVerified: user.emailVerified,
        createdAt: user.createdAt,
        deletedAt: user.deletedAt,
      })),

      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findPosts(pagination: AdminPaginationDto) {
    const { page, limit } = pagination;

    const [data, total] = await this.postsRepository.findAndCount({
      relations: {
        author: true,
      },

      order: {
        createdAt: 'DESC',
      },

      skip: (page - 1) * limit,

      take: limit,

      withDeleted: true,
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

  async findComments(pagination: AdminPaginationDto) {
    const { page, limit } = pagination;

    const [data, total] = await this.commentsRepository.findAndCount({
      relations: {
        author: true,
        post: true,
      },

      order: {
        createdAt: 'DESC',
      },

      skip: (page - 1) * limit,

      take: limit,

      withDeleted: true,
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

  async updateUserStatus(adminId: string, userId: string, status: UserStatus) {
    const user = await this.usersRepository.findOne({
      where: {
        id: userId,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found.');
    }

    if (user.status === status) {
      throw new ConflictException(`User is already ${status.toLowerCase()}.`);
    }

    user.status = status;

    await this.usersRepository.save(user);

    const isActivating = status === UserStatus.ACTIVE;

    await this.notificationsService.create({
      userId: user.id,

      type: isActivating
        ? NotificationType.ACCOUNT_ACTIVATED
        : NotificationType.ACCOUNT_DEACTIVATED,

      title: isActivating ? 'Account activated' : 'Account deactivated',

      message: isActivating
        ? 'Your account has been activated by an administrator.'
        : 'Your account has been deactivated by an administrator.',

      metadata: {
        adminId,
        status,
      },
    });

    await this.auditLogsService.create({
      adminId,

      action: isActivating
        ? AuditAction.USER_ACTIVATED
        : AuditAction.USER_DEACTIVATED,

      entityType: AuditEntityType.USER,

      entityId: user.id,

      metadata: {
        newStatus: status,
      },
    });

    return user;
  }

  async deleteUser(adminId: string, userId: string) {
    const user = await this.usersRepository.findOne({
      where: {
        id: userId,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found.');
    }

    await this.usersRepository.softRemove(user);

    await this.auditLogsService.create({
      adminId,

      action: AuditAction.USER_DELETED,

      entityType: AuditEntityType.USER,

      entityId: user.id,
    });

    return {
      message: 'User deleted successfully.',
    };
  }

  async deletePost(adminId: string, postId: string) {
    const post = await this.postsRepository.findOne({
      where: {
        id: postId,
      },
    });

    if (!post) {
      throw new NotFoundException('Post not found.');
    }

    await this.postsRepository.softRemove(post);

    await this.notificationsService.create({
      userId: post.authorId,

      type: NotificationType.POST_DELETED,

      title: 'Post deleted',

      message: 'Your post was deleted by an administrator.',

      metadata: {
        postId: post.id,
        adminId,
      },
    });

    await this.auditLogsService.create({
      adminId,

      action: AuditAction.POST_DELETED,

      entityType: AuditEntityType.POST,

      entityId: post.id,
    });

    return {
      message: 'Post deleted successfully.',
    };
  }

  async deleteComment(adminId: string, commentId: string) {
    const comment = await this.commentsRepository.findOne({
      where: {
        id: commentId,
      },
    });

    if (!comment) {
      throw new NotFoundException('Comment not found.');
    }

    await this.commentsRepository.softRemove(comment);

    await this.notificationsService.create({
      userId: comment.authorId,

      type: NotificationType.COMMENT_DELETED,

      title: 'Comment deleted',

      message: 'Your comment was deleted by an administrator.',

      metadata: {
        commentId: comment.id,
        adminId,
      },
    });

    await this.auditLogsService.create({
      adminId,

      action: AuditAction.COMMENT_DELETED,

      entityType: AuditEntityType.COMMENT,

      entityId: comment.id,
    });

    return {
      message: 'Comment deleted successfully.',
    };
  }

  async findDeletionRequests(pagination: AdminPaginationDto) {
    const { page, limit } = pagination;

    const [data, total] = await this.deletionRequestsRepository.findAndCount({
      where: {
        status: CommentDeletionRequestStatus.PENDING,
      },

      relations: {
        comment: true,
        requester: true,
      },

      order: {
        createdAt: 'ASC',
      },

      skip: (page - 1) * limit,

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

  async reviewDeletionRequest(
    adminId: string,
    requestId: string,
    dto: ReviewCommentDeletionDto,
  ) {
    const request = await this.deletionRequestsRepository.findOne({
      where: {
        id: requestId,
      },

      relations: {
        comment: true,
      },
    });

    if (!request) {
      throw new NotFoundException('Deletion request not found.');
    }

    if (request.status !== CommentDeletionRequestStatus.PENDING) {
      throw new ConflictException(
        'This deletion request has already been reviewed.',
      );
    }

    request.reviewedBy = adminId;
    request.reviewedAt = new Date();

    if (dto.decision === CommentDeletionDecision.APPROVE) {
      request.status = CommentDeletionRequestStatus.APPROVED;

      request.reason = dto.reason?.trim() || null;

      await this.commentsRepository.softRemove(request.comment);

      await this.notificationsService.create({
        userId: request.requestedBy,

        type: NotificationType.COMMENT_DELETE_APPROVED,

        title: 'Comment deletion approved',

        message: 'Your request to delete the comment has been approved.',

        metadata: {
          commentId: request.commentId,
          requestId,
          adminId,
        },
      });

      await this.auditLogsService.create({
        adminId,

        action: AuditAction.COMMENT_DELETE_APPROVED,

        entityType: AuditEntityType.COMMENT_DELETION_REQUEST,

        entityId: request.id,

        reason: dto.reason,

        metadata: {
          commentId: request.commentId,
        },
      });
    } else {
      request.status = CommentDeletionRequestStatus.REJECTED;

      if (!dto.reason?.trim()) {
        throw new ConflictException('A rejection reason is required.');
      }

      request.reason = dto.reason.trim();

      await this.notificationsService.create({
        userId: request.requestedBy,

        type: NotificationType.COMMENT_DELETE_REJECTED,

        title: 'Comment deletion rejected',

        message: `Your request to delete the comment was rejected. Reason: ${request.reason}`,

        metadata: {
          commentId: request.commentId,
          requestId,
          adminId,
          reason: request.reason,
        },
      });

      await this.auditLogsService.create({
        adminId,

        action: AuditAction.COMMENT_DELETE_REJECTED,

        entityType: AuditEntityType.COMMENT_DELETION_REQUEST,

        entityId: request.id,

        reason: request.reason,

        metadata: {
          commentId: request.commentId,
        },
      });
    }

    return this.deletionRequestsRepository.save(request);
  }
}
