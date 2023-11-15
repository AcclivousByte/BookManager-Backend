import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ResourceNotFoundException } from './resourceNotFound.exception';

@Catch(ResourceNotFoundException)
export class ResourceNotFoundExceptionFilter implements ExceptionFilter {
  catch(exception: ResourceNotFoundException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status = exception.getStatus();

    response.status(status).json({
      statusCode: status,
      message: exception.message,
    });
  }
}
