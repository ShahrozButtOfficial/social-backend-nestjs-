import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  ParseUUIDPipe,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

import { CurrentUser } from '../common/decorators/current-user.decorator';

import { User } from '../users/entities/user.entity';

import { NotificationsService } from './notifications.service';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  findAll(
    @CurrentUser() user: User,

    @Query(
      'page',
      new ParseIntPipe({
        optional: true,
      }),
    )
    page = 1,

    @Query(
      'limit',
      new ParseIntPipe({
        optional: true,
      }),
    )
    limit = 20,
  ) {
    return this.notificationsService.findForUser(
      user.id,
      page,
      Math.min(limit, 100),
    );
  }

  @Patch(':id/read')
  markAsRead(
    @CurrentUser() user: User,

    @Param('id', new ParseUUIDPipe())
    id: string,
  ) {
    return this.notificationsService.markAsRead(id, user.id);
  }

  @Patch('read-all')
  async markAllAsRead(@CurrentUser() user: User) {
    await this.notificationsService.markAllAsRead(user.id);

    return {
      message: 'All notifications marked as read.',
    };
  }
}
