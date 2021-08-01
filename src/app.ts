import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import mongoose from 'mongoose';
import compression from 'compression';

import morganMiddleware from './middlewares/morgan.middleware';
import Logger from './common/logger';
import routes from './routes';

import { errorHandler } from './middlewares/error.middleware';
import { notFoundHandler } from './middlewares/not-found.middleware';
import { rateLimiter } from './middlewares/rate-limiter.middleware';
import { ConfigService } from './common/config';

const configService = new ConfigService('.env');

class App {
  public express: express.Application;

  constructor() {
    this.express = express();

    // Logger -Morgan Middleware
    this.express.use(morganMiddleware);

    // Body parsing Middleware
    this.express.use(express.json());
    this.express.use(express.urlencoded({ extended: false }));

    this.express.use(routes);

    this.InititalizeMiddlewares();

    this.configure();

    this.InititalizeDatabaseConnection();
  }

  //App configurations
  private configure(): void {
    this.express.use(compression());
    this.express.use(helmet());
    this.express.use(cors());
  }

  // Initialize middlewares.
  private InititalizeMiddlewares(): void {
    // Error Handling Middleware
    this.express.use(errorHandler);
    this.express.use(notFoundHandler);

    //Rate limiter
    this.express.use(rateLimiter);
  }

  //Database Connection
  private InititalizeDatabaseConnection() {
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
