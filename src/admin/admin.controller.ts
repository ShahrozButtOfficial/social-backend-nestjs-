import {
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Query,
  Body,
  UseGuards,
} from '@nestjs/common';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

import { RolesGuard } from '../common/guards/roles.guard';

import { Roles } from '../common/decorators/roles.decorator';

import { CurrentUser } from '../common/decorators/current-user.decorator';

import { User } from '../users/entities/user.entity';

import { UserRole } from '../users/enums/user-role.enum';

import { UpdateUserStatusDto } from './dto/update-user-status.dto';

import { AdminPaginationDto } from './dto/admin-pagination.dto';

import { ReviewCommentDeletionDto } from './dto/review-comment-deletion.dto';

import { AdminService } from './admin.service';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('users')
  findUsers(
    @Query()
    pagination: AdminPaginationDto,
  ) {
    return this.adminService.findUsers(pagination);
  }

  @Get('posts')
  findPosts(
    @Query()
    pagination: AdminPaginationDto,
  ) {
    return this.adminService.findPosts(pagination);
  }

  @Get('comments')
  findComments(
    @Query()
    pagination: AdminPaginationDto,
  ) {
    return this.adminService.findComments(pagination);
  }

  @Patch('users/:id/status')
  updateUserStatus(
    @CurrentUser() admin: User,

    @Param('id', new ParseUUIDPipe())
    id: string,

    @Body()
    dto: UpdateUserStatusDto,
  ) {
    return this.adminService.updateUserStatus(admin.id, id, dto.status);
  }

  @Delete('users/:id')
  deleteUser(
    @CurrentUser() admin: User,

    @Param('id', new ParseUUIDPipe())
    id: string,
  ) {
    return this.adminService.deleteUser(admin.id, id);
  }

  @Delete('posts/:id')
  deletePost(
    @CurrentUser() admin: User,

    @Param('id', new ParseUUIDPipe())
    id: string,
  ) {
    return this.adminService.deletePost(admin.id, id);
  }

  @Delete('comments/:id')
  deleteComment(
    @CurrentUser() admin: User,

    @Param('id', new ParseUUIDPipe())
    id: string,
  ) {
    return this.adminService.deleteComment(admin.id, id);
  }

  @Get('comment-deletion-requests')
  findDeletionRequests(
    @Query()
    pagination: AdminPaginationDto,
  ) {
    return this.adminService.findDeletionRequests(pagination);
  }

  @Patch('comment-deletion-requests/:id')
  reviewDeletionRequest(
    @CurrentUser() admin: User,

    @Param('id', new ParseUUIDPipe())
    id: string,

    @Body()
    dto: ReviewCommentDeletionDto,
  ) {
    return this.adminService.reviewDeletionRequest(admin.id, id, dto);
  }
}
