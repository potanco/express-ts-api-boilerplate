import cors from 'cors';
import express, { Request, Response } from 'express';
import helmet from 'helmet';
import mongoose from 'mongoose';
import compression from 'compression';
import swaggerUi from 'swagger-ui-express';
import swaggerJSON from './docs/swagger.json';

import { morganMiddleware } from './middlewares/morgan.middleware';
import { Logger } from './common/logger';

import { errorHandler } from './middlewares/error.middleware';
import { notFoundHandler } from './middlewares/not-found.middleware';
import { rateLimiter } from './middlewares/rate-limiter.middleware';

import { ConfigService } from './common/config';

const configService = new ConfigService('.env');

class App {
  public express: express.Application;
  PORT: number = parseInt(configService.get('APP_PORT') as string, 10);

  constructor(routes: any[]) {
    this.express = express();

    // Logger -Morgan Middleware

    this.express.use(morganMiddleware);

    // Body parsing Middleware
    this.express.use(express.json());
    this.express.use(express.urlencoded({ extended: false }));

    //Swagger Route

    this.express.use(
      '/api/docs',
      swaggerUi.serve,
      async (_req: Request, res: Response) => {
        return res.send(swaggerUi.generateHTML(swaggerJSON));
      }
    );

    this.initializeControllers(routes);

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

  private initializeControllers(routes: any[]) {
    routes.forEach((route) => {
      this.express.use('/api/v1/', route.router);
    });
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
      await mongoose.connect(configService.get('MONGODB_URI'));
    };

    run().catch((error) => Logger.error(`${error}`));
  }

  public listen() {
    this.express.listen(this.PORT || 3000, () => {
      Logger.info(`⚡️[Server] listening on the port ${this.PORT}`);
    });
  }
}

export default App;
