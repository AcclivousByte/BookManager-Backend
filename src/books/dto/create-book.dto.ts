import { IsNotEmpty, IsString, IsISBN, MaxLength } from 'class-validator';

export class CreateBookDto {
  @MaxLength(50, {
    message: 'Title is too long. Maximum length is 50 characters.',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsISBN(13)
  @IsNotEmpty()
  isbn: string;
}
