import { Injectable } from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { Notification, NotificationType } from './entities/notification.entity';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationsRepository: Repository<Notification>,
  ) {}

  async create(data: {
    userId: string;
    type: NotificationType;
    title: string;
    message: string;
    metadata?: Record<string, unknown>;
  }): Promise<Notification> {
    const notification = this.notificationsRepository.create({
      userId: data.userId,
      type: data.type,
      title: data.title,
      message: data.message,
      metadata: data.metadata ?? null,
    });

    return this.notificationsRepository.save(notification);
  }

  async findForUser(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [data, total] = await this.notificationsRepository.findAndCount({
      where: {
        userId,
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

  async markAsRead(id: string, userId: string): Promise<Notification> {
    const notification = await this.notificationsRepository.findOne({
      where: {
        id,
        userId,
      },
    });

    if (!notification) {
      throw new Error('Notification not found.');
    }

    notification.isRead = true;

    return this.notificationsRepository.save(notification);
  }

  async markAllAsRead(userId: string): Promise<void> {
    await this.notificationsRepository.update(
      {
        userId,
        isRead: false,
      },
      {
        isRead: true,
      },
    );
  }
}
