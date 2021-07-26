import * as dotenv from 'dotenv';
import { createServer } from 'http';

import App from './app';

/**
 * App Variables
 */
dotenv.config();

if (!process.env.APP_PORT) {
  process.exit(1);
}

const PORT: number = parseInt(process.env.APP_PORT as string, 10);

App.set('port', PORT);

const server = createServer(App);
server.listen(PORT);

server.on('listening', function (): void {
  let addr = server.address();

  let bind = typeof addr === 'string' ? `pipe ${addr}` : `port ${addr? addr.port: PORT}`;
  console.log(
    `⚡️[server]: Server is running on port ${bind}`
  );
});

module.exports = App;
