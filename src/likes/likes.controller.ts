import {
  Body,
  Controller,
  Delete,
  Param,
  ParseEnumPipe,
  ParseUUIDPipe,
  Post as HttpPost,
  UseGuards,
} from '@nestjs/common';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

import { CurrentUser } from '../common/decorators/current-user.decorator';

import { User } from '../users/entities/user.entity';

import { LikesService } from './likes.service';

import { CreateLikeDto } from './dto/create-like.dto';

import { LikeTargetType } from './enums/like-target-type.enum';

@Controller('likes')
@UseGuards(JwtAuthGuard)
export class LikesController {
  constructor(private readonly likesService: LikesService) {}

  @HttpPost()
  like(@CurrentUser() user: User, @Body() dto: CreateLikeDto) {
    return this.likesService.like(user, dto);
  }

  @Delete(':targetType/:targetId')
  async unlike(
    @CurrentUser() user: User,

    @Param('targetType', new ParseEnumPipe(LikeTargetType))
    targetType: LikeTargetType,

    @Param('targetId', new ParseUUIDPipe())
    targetId: string,
  ) {
    await this.likesService.unlike(user, targetId, targetType);

    return {
      message: 'Like removed successfully.',
    };
  }
}
