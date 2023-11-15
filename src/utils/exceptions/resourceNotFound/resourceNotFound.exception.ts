import { HttpException, HttpStatus } from '@nestjs/common';

export class ResourceNotFoundException extends HttpException {
  constructor(resource: string, id: string) {
    super(
      {
        status: HttpStatus.BAD_REQUEST,
        error: 'ResourceNotFoundException',
        message: `${resource} with id ${id} not found`,
      },
      HttpStatus.BAD_REQUEST,
    );
  }
}
