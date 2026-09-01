import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class UpdatePostDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(10000)
  content!: string;
}
