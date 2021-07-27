import * as dotenv from 'dotenv';
import { createServer } from 'http';

import App from './app';
import { ConfigService } from './common/config';
import Logger from './common/logger';

/**
 * App Variables
 */
const configService = new ConfigService('.env');

const PORT: number = parseInt(configService.get('APP_PORT') as string, 10);

App.set('port', PORT);

const server = createServer(App);
server.listen(PORT);

server.on('listening', function (): void {
  let addr = server.address();

  let bind = typeof addr === 'string' ? `pipe ${addr}` : `port ${addr? addr.port: PORT}`;
  Logger.debug(
    `⚡️[server]: Server is running on port ${bind}`
  );
});

module.exports = App;
