import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';

export enum CommentDeletionDecision {
  APPROVE = 'APPROVE',
  REJECT = 'REJECT',
}

export class ReviewCommentDeletionDto {
  @IsEnum(CommentDeletionDecision)
  decision!: CommentDeletionDecision;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  reason?: string;
}
