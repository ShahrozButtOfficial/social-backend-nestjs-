import { IsEnum, IsInt, IsOptional, Max, Min } from 'class-validator';

import { Type } from 'class-transformer';

import { UserStatus } from '../../users/enums/user-status.enum';

export class AdminPaginationDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit = 20;

  @IsOptional()
  @IsEnum(UserStatus)
  status?: UserStatus;
}
