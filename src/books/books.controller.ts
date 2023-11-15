import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpException,
  HttpStatus,
  UseInterceptors,
} from '@nestjs/common';
import { BooksService } from './books.service';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { ResourceNotFoundException } from '../utils/exceptions/resourceNotFound/resourceNotFound.exception';
import { ResponseTransformInterceptor } from '../utils/interceptors/responseTransform.interceptor';

@Controller('books')
@UseInterceptors(ResponseTransformInterceptor)
export class BooksController {
  constructor(private readonly booksService: BooksService) {}

  @Post()
  async create(@Body() createBookDto: CreateBookDto) {
    const sameIsbnBookFound = await this.booksService.findOne({
      isbn: createBookDto.isbn,
    });

    if (sameIsbnBookFound) {
      throw new HttpException(
        `Book with isbn ${createBookDto.isbn} already exists`,
        HttpStatus.BAD_REQUEST,
      );
    }

    const book = await this.booksService.create(createBookDto);

    return { message: 'Book created successfully', data: book };
  }

  @Get()
  async findAll() {
    const books = await this.booksService.findAll();

    return { message: 'Books fetched successfully', data: books };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const book = await this.booksService.findOne({ id });

    if (!book) {
      throw new ResourceNotFoundException('Book', id);
    }

    return { message: 'Book details fetched successfully', data: book };
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateBookDto: UpdateBookDto) {
    const book = await this.booksService.findOne({ id });

    if (!book) {
      throw new ResourceNotFoundException('Book', id);
    }

    await this.booksService.update(book, updateBookDto);

    return { message: 'Book updated successfully', data: book };
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    const book = await this.booksService.findOne({ id });

    if (!book) {
      throw new ResourceNotFoundException('Book', id);
    }

    await this.booksService.remove(book);

    return { message: 'Book deleted successfully', data: book };
  }
}
