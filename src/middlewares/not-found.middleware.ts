import { Request, Response, NextFunction } from 'express';

export const notFoundHandler = (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  response.status(404).json({
    error: 404,
    message: 'Not Found',
    description: 'Resource Not Found.'
  });
};
