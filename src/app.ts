import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import mongoose from 'mongoose';

import morganMiddleware from './middleware/morgan.middleware';
import Logger from './common/logger';
import routes from './routes';

import { errorHandler } from './middleware/error.middleware';
import { notFoundHandler } from './middleware/not-found.middleware';
import { rateLimiter } from './middleware/rateLimiter.middleware';
import { ConfigService } from './common/config';

const configService = new ConfigService('.env');

class App {
  public express: express.Application;

  constructor() {
    this.express = express();

    // Logger -Morgan Middleware
    this.express.use(morganMiddleware);

    this.express.use(routes);
    
    this.middleware();
    this.configure();
    this.setupDatabaseConnection();
  }

  //App configurations
  private configure(): void {
    this.express.use(helmet());
    this.express.use(cors());
  }

  // Configure Express middleware.
  private middleware(): void {
    // Body parsing Middleware
    this.express.use(express.json());
    this.express.use(express.urlencoded({ extended: false }));

    // Error Handling Middleware
    this.express.use(errorHandler);
    this.express.use(notFoundHandler);

    // Rate Limiter Middleware
    this.express.use(rateLimiter);
  }

  //Database Connection
  private setupDatabaseConnection() {
    const connection = mongoose.connection;
    connection.on('connected', () => {
      Logger.info('⚡️[Mongo] Connection Established');
    });
    connection.on('reconnected', () => {
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
