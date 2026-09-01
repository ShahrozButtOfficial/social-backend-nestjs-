import { IsEnum, IsUUID } from 'class-validator';

import { LikeTargetType } from '../enums/like-target-type.enum';

export class CreateLikeDto {
  @IsUUID()
  targetId!: string;

  @IsEnum(LikeTargetType)
  targetType!: LikeTargetType;
}
