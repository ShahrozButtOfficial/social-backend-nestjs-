import { Module } from '@nestjs/common';

import { ConfigModule, ConfigService } from '@nestjs/config';

import { TypeOrmModule } from '@nestjs/typeorm';

import databaseConfig from './config/database.config';

import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { PostsModule } from './posts/posts.module';
import { CommentsModule } from './comments/comments.module';
import { LikesModule } from './likes/likes.module';
import { AdminModule } from './admin/admin.module';

import { NotificationsModule } from './notifications/notifications.module';

import { AuditLogsModule } from './audit-logs/audit-logs.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig],
    }),

    TypeOrmModule.forRootAsync({
      inject: [ConfigService],

      useFactory: (configService: ConfigService) => ({
        type: 'postgres',

        host: configService.get<string>('database.host'),

        port: configService.get<number>('database.port'),

        username: configService.get<string>('database.username'),

        password: configService.get<string>('database.password'),

        database: configService.get<string>('database.database'),

        autoLoadEntities: true,

        synchronize: false,
      }),
    }),

    UsersModule,
    AuthModule,
    PostsModule,
    CommentsModule,
    LikesModule,
    NotificationsModule,
    AuditLogsModule,
    AdminModule,
  ],
})
export class AppModule {}
