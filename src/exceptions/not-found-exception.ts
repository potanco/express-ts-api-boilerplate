import { HttpException } from './http-exception';

export class NotFoundException extends HttpException {
  constructor(description: string) {
    super(404, 'Not Found Exception', description);
  }
}
