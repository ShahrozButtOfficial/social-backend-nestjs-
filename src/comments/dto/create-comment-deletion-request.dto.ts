import { IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateCommentDeletionRequestDto {
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  reason?: string;
}
