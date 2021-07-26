/**
 * Required External Modules
 */
import * as dotenv from 'dotenv';
import helmet from 'helmet';
import cors from 'cors';
import express, { Request, Response } from 'express';
import swaggerUi from 'swagger-ui-express';

import morganMiddleware from './middleware/morgan.middleware';
import { errorHandler } from './middleware/error.middleware';
import { notFoundHandler } from './middleware/not-found.middleware';
import { rateLimiter } from './middleware/rateLimiter.middleware';


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

/**
 * Body parsing Middleware
 */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/**
 * Error Handling Middleware
 */
app.use(errorHandler);
app.use(notFoundHandler);

/**
 * Rate Limiter Middleware 
 */
app.use(rateLimiter);

/**
 * Swagger
 */
app.use('/docs', swaggerUi.serve, async (_req: Request, res: Response) => {
  return res.send(swaggerUi.generateHTML(await import('../swagger.json')));
});

/** 
 * Routes
 */

app.get('/', (req, res) => res.send('Express + TypeScript Server'));

/**
 * Server Activation
 */
app.listen(PORT, () => {
  console.log(`⚡️[server]: Server is running at https://localhost:${PORT}`);
});
