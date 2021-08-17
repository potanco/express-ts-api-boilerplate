export class HttpException extends Error {
  error?: number;
  status?: number;
  message: string;
  description: string | null;

  constructor(error: number, message: string, description?: string) {
    super(message);
    this.error = error;

    this.message = message;
    this.description = description || null;
  }
}
