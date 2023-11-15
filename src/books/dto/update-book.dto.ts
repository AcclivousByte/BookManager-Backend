import { OmitType } from '@nestjs/mapped-types';
import { CreateBookDto } from './create-book.dto';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class UpdateBookDto extends OmitType(CreateBookDto, ['isbn'] as const) {
  @MaxLength(50, {
    message: 'Title is too long. Maximum length is 50 characters.',
  })
  @IsString()
  @IsNotEmpty()
  title: string;
}
