import cors from 'cors';
import express, { Request, Response } from 'express';
import helmet from 'helmet';
import swaggerUi from 'swagger-ui-express';
import { errorHandler } from './middleware/error.middleware';
import morganMiddleware from './middleware/morgan.middleware';
import { notFoundHandler } from './middleware/not-found.middleware';
import { rateLimiter } from './middleware/rateLimiter.middleware';

class App {
  public express: express.Application;

  constructor() {
    this.express = express();
    this.middleware();
    this.configure();
    this.routes();
  }

  //App configurations
  private configure(): void {
    this.express.use(helmet());
    this.express.use(cors());
  }

  // Configure Express middleware.
  private middleware(): void {
    /**
     * Body parsing Middleware
     */
    this.express.use(express.json());
    this.express.use(express.urlencoded({ extended: false }));

    /**
     * Error Handling Middleware
     */
    this.express.use(errorHandler);
    this.express.use(notFoundHandler);

    /**
     * Rate Limiter Middleware
     */
    this.express.use(rateLimiter);

    /**
     * Morgan Middleware
     */
    this.express.use(morganMiddleware);
  }

  private routes(): void {
    this.express.use('/', (req, res, next) => {
      res.send('Typescript App works!!!');
    });

    /**
     * Swagger
     */
    this.express.use(
      '/docs',
      swaggerUi.serve,
      async (_req: Request, res: Response) => {
        return res.send(
          swaggerUi.generateHTML(await import('../swagger.json'))
        );
      }
    );
  }
}

export default new App().express;
