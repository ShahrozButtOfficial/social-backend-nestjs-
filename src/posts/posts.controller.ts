import {
  Body,
  Controller,
  Delete,
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

import { PostsService } from './posts.service';

import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PaginationDto } from './dto/pagination.dto';

@Controller('posts')
@UseGuards(JwtAuthGuard)
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @HttpPost()
  create(@CurrentUser() user: User, @Body() dto: CreatePostDto) {
    return this.postsService.create(user, dto);
  }

  @Get()
  findAll(@Query() pagination: PaginationDto) {
    return this.postsService.findAll(pagination);
  }

  @Get(':id')
  findById(
    @Param('id', new ParseUUIDPipe())
    id: string,
  ) {
    return this.postsService.findById(id);
  }

  @Patch(':id')
  update(
    @Param('id', new ParseUUIDPipe())
    id: string,

    @CurrentUser() user: User,

    @Body() dto: UpdatePostDto,
  ) {
    return this.postsService.update(id, user, dto);
  }

  @Delete(':id')
  async remove(
    @Param('id', new ParseUUIDPipe())
    id: string,

    @CurrentUser() user: User,
  ) {
    await this.postsService.remove(id, user);

    return {
      message: 'Post deleted successfully.',
    };
  }
}
