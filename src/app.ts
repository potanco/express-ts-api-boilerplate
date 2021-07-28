import cors from 'cors';
import express, { Request, Response } from 'express';
import helmet from 'helmet';
import swaggerUi from 'swagger-ui-express';
import mongoose from "mongoose";

import morganMiddleware from './middleware/morgan.middleware';

import { errorHandler } from './middleware/error.middleware';
import { notFoundHandler } from './middleware/not-found.middleware';
import { rateLimiter } from './middleware/rateLimiter.middleware';
import Logger from './common/logger';
import { ConfigService } from './common/config';

const configService = new ConfigService('.env');

class App {
  public express: express.Application;

  constructor() {
    this.express = express();
    this.middleware();
    this.configure();
    this.routes();
    this.setupDatabaseConnection();
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
    this.express.get('/', (req, res, next) => {
      res.send('Typescript App works!!');
    });
    /**
     * Swagger
     */
    this.express.get(
      '/docs',
      swaggerUi.serve,
      async (_req: Request, res: Response) => {
        return res.send(
          swaggerUi.generateHTML(await import('../swagger.json'))
        );
      }
    );
  }

   private setupDatabaseConnection() {
    const connection = mongoose.connection;
    connection.on("connected", () => {
      Logger.info('⚡️[Mongo] Connection Established');
    });
    connection.on("reconnected", () => {
      Logger.info('⚡️[Mongo] Connection Reestablished');
    });

    const run = async () => {
      await mongoose.connect(configService.get('MONGODB_URI'), {
        useUnifiedTopology: true,
        useNewUrlParser: true,
        useCreateIndex: true
      });
    };

    run().catch((error) => Logger.error(`${error}`));
  }
}
export default new App().express;