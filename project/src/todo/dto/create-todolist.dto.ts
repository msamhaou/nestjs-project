import { 
  IsString, 
  IsNotEmpty, 
  MaxLength,
  MinLength
} from 'class-validator';

export class CreateTodoListDto {
  @IsString({ message: 'Title must be a string' })
  @IsNotEmpty({ message: 'Title cannot be empty' })
  @MinLength(3, { message: 'Title must be at least 3 characters long' })
  @MaxLength(100, { message: 'Title cannot exceed 100 characters' })
  title: string;
}