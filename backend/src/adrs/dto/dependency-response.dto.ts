import { IsString } from 'class-validator';

export class DependencyResponseDto {
  @IsString()
  id!: string;

  @IsString()
  title!: string;

  @IsString()
  status!: string;
}