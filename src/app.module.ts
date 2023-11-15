import { Module } from '@nestjs/common';
import { BooksModule } from './books/books.module';
import { SequelizeModule } from '@nestjs/sequelize';
import { Book } from './books/models/book.model';
import { ConfigModule, ConfigService } from '@nestjs/config';
import databaseConfig from './utils/config/database.config';
import { SequelizeModuleOptions } from '@nestjs/sequelize/dist/interfaces/sequelize-options.interface';

@Module({
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
        autoLoadModels: configService.get<boolean>('database.autoLoadModels'),
        synchronize: configService.get<boolean>('database.synchronize'),
        models: [Book],
      }),
      inject: [ConfigService],
    }),
    BooksModule,
  ],
})
export class AppModule {}
