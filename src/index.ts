import express from "express";
import Logger from './configs/logger';
import morganMiddleware from "./configs/morgan.middleware";

const app = express();

app.use(morganMiddleware);

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


const PORT = 3000;
app.get('/', (req, res) => res.send('Express + TypeScript Server'));
app.listen(PORT, () => {
  console.log(`⚡️[server]: Server is running at https://localhost:${PORT}`);
});
