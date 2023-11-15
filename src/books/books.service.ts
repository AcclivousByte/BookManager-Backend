import { Injectable } from '@nestjs/common';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { InjectModel } from '@nestjs/sequelize';
import { Book } from './models/book.model';

@Injectable()
export class BooksService {
  constructor(
    @InjectModel(Book)
    private bookModel: typeof Book,
  ) {}

  async create(createBookDto: CreateBookDto) {
    return await this.bookModel.create({ ...createBookDto });
  }

  async findAll(): Promise<Book[]> {
    return await this.bookModel.findAll();
  }

  async findOne(filter?: {
    id?: string;
    title?: string;
    isbn?: string;
  }): Promise<Book> {
    return await this.bookModel.findOne({
      where: filter,
    });
  }

  async update(bookInstance, updateBookDto: UpdateBookDto) {
    bookInstance.set(updateBookDto);

    return await bookInstance.save();
  }

  async remove(bookInstance): Promise<void> {
    await bookInstance.destroy();
  }
}
