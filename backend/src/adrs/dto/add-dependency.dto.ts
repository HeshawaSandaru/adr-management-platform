import { IsMongoId } from 'class-validator';

export class AddDependencyDto {
  @IsMongoId()
  dependencyId!: string;
}