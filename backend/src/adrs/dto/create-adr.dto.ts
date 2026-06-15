import {
  IsArray,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateAdrDto {
  @IsString()
  title!: string;

  @IsString()
  problem!: string;

  @IsString()
  solution!: string;

  @IsOptional()
  @IsString()
  authorId?: string;

  @IsOptional()
  @IsArray()
  tags?: string[];

  @IsOptional()
  @IsArray()
  alternatives?: string[];
}