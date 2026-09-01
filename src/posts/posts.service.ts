import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { Post } from './entities/post.entity';

import { User } from '../users/entities/user.entity';

import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PaginationDto } from './dto/pagination.dto';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post)
    private readonly postsRepository: Repository<Post>,
  ) {}

  async create(user: User, dto: CreatePostDto): Promise<Post> {
    const post = this.postsRepository.create({
      authorId: user.id,
      content: dto.content.trim(),
    });

    return this.postsRepository.save(post);
  }

  async findAll(pagination: PaginationDto) {
    const { page, limit } = pagination;

    const skip = (page - 1) * limit;

    const [data, total] = await this.postsRepository.findAndCount({
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

  async findById(id: string): Promise<Post> {
    const post = await this.postsRepository.findOne({
      where: { id },
      relations: {
        author: true,
      },
    });

    if (!post) {
      throw new NotFoundException('Post not found.');
    }

    return post;
  }

  async update(id: string, user: User, dto: UpdatePostDto): Promise<Post> {
    const post = await this.findById(id);

    if (post.authorId !== user.id) {
      throw new ForbiddenException('You can only update your own posts.');
    }

    post.content = dto.content.trim();

    return this.postsRepository.save(post);
  }

  async remove(id: string, user: User): Promise<void> {
    const post = await this.findById(id);

    if (post.authorId !== user.id) {
      throw new ForbiddenException('You can only delete your own posts.');
    }

    await this.postsRepository.softRemove(post);
  }
}
