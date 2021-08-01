import HttpException from './http-exception';

export default class BadRequestException extends HttpException {
  constructor(message: string) {
    super(400, message, 'Bad Request Exception');
  }
}
