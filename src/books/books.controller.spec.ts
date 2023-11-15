import { Test, TestingModule } from '@nestjs/testing';
import { BooksController } from './books.controller';
import { BooksService } from './books.service';
import { Book } from './models/book.model';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { SequelizeModule, SequelizeModuleOptions } from '@nestjs/sequelize';
import { ResourceNotFoundException } from '../utils/exceptions/resourceNotFound/resourceNotFound.exception';
import { ConfigModule, ConfigService } from '@nestjs/config';
import databaseConfig from '../utils/config/database.config';

describe('BooksController', () => {
  let controller: BooksController;
  let service: BooksService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          load: [databaseConfig],
        }),
        SequelizeModule.forRootAsync({
          imports: [ConfigModule],
          useFactory: async (
            configService: ConfigService,
          ): Promise<SequelizeModuleOptions> => ({
            dialect:
              configService.get<import('sequelize/types').Dialect>(
                'database.dialect',
              ),
            host: configService.get<string>('database.host'),
            port: configService.get<number>('database.port'),
            username: configService.get<string>('database.username'),
            password: configService.get<string>('database.password'),
            database: configService.get<string>('database.database'),
            autoLoadModels: configService.get<boolean>(
              'database.autoLoadModels',
            ),
            synchronize: configService.get<boolean>('database.synchronize'),
            models: [Book],
          }),
          inject: [ConfigService],
        }),
      ],
      controllers: [BooksController],
      providers: [BooksService],
    }).compile();

    controller = module.get<BooksController>(BooksController);
    service = module.get<BooksService>(BooksService);
  });

  describe('create', () => {
    it('should create a new book', async () => {
      const createBookDto: CreateBookDto = {
        title: 'Test Book',
        isbn: '1234567890123',
      };

      jest.spyOn(service, 'findOne').mockResolvedValueOnce(null);
      jest
        .spyOn(service, 'create')
        .mockResolvedValueOnce(createBookDto as Book);

      const result = await controller.create(createBookDto);

      expect(result).toEqual({
        message: 'Book created successfully',
        data: createBookDto as Book,
      });
    });

    it('should handle duplicate ISBN on create', async () => {
      const createBookDto: CreateBookDto = {
        title: 'Test Book',
        isbn: '1234567890123',
      };

      jest
        .spyOn(service, 'findOne')
        .mockResolvedValueOnce(createBookDto as Book);

      await expect(controller.create(createBookDto)).rejects.toThrowError(
        new Error(`Book with isbn ${createBookDto.isbn} already exists`),
      );
    });
  });

  describe('findAll', () => {
    it('should return an array of books', async () => {
      const books: Book[] = [
        Book.build({
          id: 1,
          title: 'Book 1',
          isbn: '1234567890123',
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null,
        }),
      ];

      jest.spyOn(service, 'findAll').mockResolvedValueOnce(books);

      const result = await controller.findAll();

      expect(result).toEqual({
        message: 'Books fetched successfully',
        data: books,
      });
    });
  });

  describe('findOne', () => {
    it('should return a single book by ID', async () => {
      const bookId = '1';
      const book: Book = Book.build({
        id: 1,
        title: 'Book 1',
        isbn: '1234567890123',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      });

      jest.spyOn(service, 'findOne').mockResolvedValueOnce(book);

      const result = await controller.findOne(bookId);

      expect(result).toEqual({
        message: 'Book details fetched successfully',
        data: book,
      });
    });

    it('should handle not found book on findOne', async () => {
      const bookId = '999';

      jest.spyOn(service, 'findOne').mockResolvedValueOnce(null);

      await expect(controller.findOne(bookId)).rejects.toThrowError(
        new ResourceNotFoundException('Book', bookId),
      );
    });
  });

  describe('update', () => {
    it('should update a book', async () => {
      const bookId = '1';
      const updateBookDto: UpdateBookDto = {
        title: 'Updated Book Title',
      };
      const existingBook: Book = Book.build({
        id: 1,
        title: 'Book 1',
        isbn: '1234567890123',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      });
      const updatedBook: Book = Book.build({
        ...existingBook,
        ...updateBookDto,
      });

      jest.spyOn(service, 'findOne').mockResolvedValueOnce(existingBook);
      jest.spyOn(service, 'update').mockResolvedValueOnce(updatedBook);

      const result = await controller.update(bookId, updateBookDto);

      expect(result).toEqual({
        message: 'Book updated successfully',
        data: existingBook,
      });
    });

    it('should handle not found book on update', async () => {
      const bookId = '999';
      const updateBookDto: UpdateBookDto = {
        title: 'Updated Book Title',
      };

      jest.spyOn(service, 'findOne').mockResolvedValueOnce(null);

      await expect(
        controller.update(bookId, updateBookDto),
      ).rejects.toThrowError(new ResourceNotFoundException('Book', bookId));
    });
  });

  describe('remove', () => {
    it('should delete a book', async () => {
      const bookId = '1';
      const book: Book = Book.build({
        id: 1,
        title: 'Book 1',
        isbn: '1234567890123',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      });

      jest.spyOn(service, 'findOne').mockResolvedValueOnce(book);
      jest.spyOn(service, 'remove').mockResolvedValueOnce();

      const result = await controller.remove(bookId);

      expect(result).toEqual({
        message: 'Book deleted successfully',
        data: book,
      });
    });

    it('should handle not found book on delete', async () => {
      const bookId = '999';

      jest.spyOn(service, 'findOne').mockResolvedValueOnce(null);

      await expect(controller.remove(bookId)).rejects.toThrowError(
        new ResourceNotFoundException('Book', bookId),
      );
    });
  });

  it('should list all books after creating two and show only one after deleting one', async () => {
    // Create two books
    const createBookDto1: CreateBookDto = {
      title: 'Book 1',
      isbn: '1234567890123',
    };
    const createBookDto2: CreateBookDto = {
      title: 'Book 2',
      isbn: '1234567890456',
    };

    const createdBook1 = await controller.create(createBookDto1);
    const createdBook2 = await controller.create(createBookDto2);

    // Assert that books were created successfully
    expect(createdBook1.message).toBe('Book created successfully');
    expect(createdBook2.message).toBe('Book created successfully');

    createdBook1.data = Book.build({
      id: 1,
      title: 'Book 1',
      isbn: '1234567890123',
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    });

    // Mock the BooksService to return the expected data
    jest
      .spyOn(service, 'findAll')
      .mockResolvedValueOnce([createdBook1.data, createdBook2.data]);

    // List all books after creating two
    const allBooksBeforeDeletion = await controller.findAll();

    // Assert that all books were fetched successfully
    expect(allBooksBeforeDeletion.message).toBe('Books fetched successfully');
    expect(allBooksBeforeDeletion.data).toHaveLength(2);

    // Mock the BooksService to return the book for findOne
    jest.spyOn(service, 'findOne').mockResolvedValueOnce(createdBook1.data);

    jest.spyOn(service, 'remove').mockResolvedValueOnce();

    // Delete one book
    await controller.remove(String(createdBook1.data.id));

    // Mock the BooksService again to return the expected data after deletion
    jest.spyOn(service, 'findAll').mockResolvedValueOnce([createdBook2.data]);

    // List all books after deleting one
    const allBooksAfterDeletion = await controller.findAll();

    // Assert that the book was deleted successfully
    expect(allBooksAfterDeletion.message).toBe('Books fetched successfully');
    expect(allBooksAfterDeletion.data).toHaveLength(1);
  });
});

jest.mock('./books.service', () => {
  return {
    BooksService: jest.fn(() => ({
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    })),
  };
});
