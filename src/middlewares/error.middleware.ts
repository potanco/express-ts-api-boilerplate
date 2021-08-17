import { HttpException } from '../exceptions/http-exception';
import { Request, Response, NextFunction } from 'express';

export const errorHandler = (
  error: HttpException,
  request: Request,
  response: Response,
  next: NextFunction
) => {
  const status = error.error || error.status || 500;  
  response.status(status).json({
    success: false,
    error: error.error ? error.error : 500,
    message: error.message,
    description: error.description,
    data: {}
  });
};
