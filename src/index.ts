// import { createServer } from 'http';
import * as http from 'http';

import { ConfigService } from './common/config';

import App from './app';
import Logger from './common/logger';

/**
 * App Variables
 */
const configService = new ConfigService('.env');

const PORT: number = parseInt(configService.get('APP_PORT') as string, 10);

App.set('port', PORT);

const server = http.createServer(App);
server.listen(PORT);

server.on('listening', function (): void {
  let addr = server.address();
  let bind =
    typeof addr === 'string'
      ? `pipe ${addr}`
      : `port ${addr ? addr.port : PORT}`;
  Logger.info(`⚡️[server]: Server is running on ${bind}`);
});

module.exports = App;
