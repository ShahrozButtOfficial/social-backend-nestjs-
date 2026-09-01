import { createParamDecorator, ExecutionContext } from '@nestjs/common';

import type { User } from '../../users/entities/user.entity';

interface AuthenticatedRequest {
  user: User;
}

export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): User => {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();

    return request.user;
  },
);
