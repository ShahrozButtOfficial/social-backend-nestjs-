import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { Like } from './entities/like.entity';

import { LikeTargetType } from './enums/like-target-type.enum';

import { CreateLikeDto } from './dto/create-like.dto';

import { Post } from '../posts/entities/post.entity';
import { Comment } from '../comments/entities/comment.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class LikesService {
  constructor(
    @InjectRepository(Like)
    private readonly likesRepository: Repository<Like>,

    @InjectRepository(Post)
    private readonly postsRepository: Repository<Post>,

    @InjectRepository(Comment)
    private readonly commentsRepository: Repository<Comment>,
  ) {}

  async like(user: User, dto: CreateLikeDto): Promise<Like> {
    await this.validateTarget(dto.targetId, dto.targetType);

    const existingLike = await this.likesRepository.findOne({
      where: {
        userId: user.id,
        targetId: dto.targetId,
        targetType: dto.targetType,
      },
    });

    if (existingLike) {
      throw new ConflictException('You have already liked this item.');
    }

    const like = this.likesRepository.create({
      userId: user.id,
      targetId: dto.targetId,
      targetType: dto.targetType,
    });

    return this.likesRepository.save(like);
  }

  async unlike(
    user: User,
    targetId: string,
    targetType: LikeTargetType,
  ): Promise<void> {
    const like = await this.likesRepository.findOne({
      where: {
        userId: user.id,
        targetId,
        targetType,
      },
    });

    if (!like) {
      throw new NotFoundException('Like not found.');
    }

    await this.likesRepository.remove(like);
  }

  async countLikes(
    targetId: string,
    targetType: LikeTargetType,
  ): Promise<number> {
    return this.likesRepository.count({
      where: {
        targetId,
        targetType,
      },
    });
  }

  private async validateTarget(
    targetId: string,
    targetType: LikeTargetType,
  ): Promise<void> {
    if (targetType === LikeTargetType.POST) {
      const post = await this.postsRepository.findOne({
        where: {
          id: targetId,
        },
      });

      if (!post) {
        throw new NotFoundException('Post not found.');
      }

      return;
    }

    if (targetType === LikeTargetType.COMMENT) {
      const comment = await this.commentsRepository.findOne({
        where: {
          id: targetId,
        },
      });

      if (!comment) {
        throw new NotFoundException('Comment not found.');
      }

      return;
    }

    throw new NotFoundException('Invalid like target.');
  }
}
