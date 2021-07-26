/**
 * Required External Modules
 */

import * as dotenv from 'dotenv';
import helmet from 'helmet';
import cors from 'cors';
import express, { Request, Response } from 'express';
import swaggerUi from 'swagger-ui-express';

import Logger from './configs/logger';
import morganMiddleware from './configs/morgan.middleware';
import { errorHandler } from './middleware/error.middleware';
import { notFoundHandler } from './middleware/not-found.middleware';
/**
 * App Variables
 */
dotenv.config();

if (!process.env.APP_PORT) {
  process.exit(1);
}

const PORT: number = parseInt(process.env.APP_PORT as string, 10);

const app = express();

/**
 *  App Configuration
 */
app.use(helmet());
app.use(cors());
app.use(morganMiddleware);
app.use(express.json());

/**
 * Logger test
 */
app.get('/logger', (_, res) => {
  Logger.error('This is an error log');
  Logger.warn('This is a warn log');
  Logger.info('This is a info log');
  Logger.http('This is a http log');
  Logger.debug('This is a debug log');

  res.send('Hello world');
});

/**
 * SWAGGER
 */
app.use('/docs', swaggerUi.serve, async (_req: Request, res: Response) => {
  return res.send(swaggerUi.generateHTML(await import('../swagger.json')));
});

app.get('/', (req, res) => res.send('Express + TypeScript Server'));

app.use(errorHandler);
app.use(notFoundHandler);

/**
 * Server Activation
 */
app.listen(PORT, () => {
  console.log(`⚡️[server]: Server is running at https://localhost:${PORT}`);
});
