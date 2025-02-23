import { HttpException } from '@nestjs/common';

export class CodedHttpException<T extends string = any> extends HttpException {
  constructor(
    message: string,
    status: number,
    public readonly code: T | null,
  ) {
    super(message, status);
  }
}
