import * as extend from 'extend';
import * as Redis from 'ioredis';
import * as Log4js from 'log4js';

import Logger from './Logger';

class Options {

  public prefix: string = 'timer';
  public ttl: number = 2000;
  public connection: Redis.RedisOptions = Object.assign({
    showFriendlyErrorStack: true
  });
  public tasks: { [key:string]: (string) => void } = {};
  public logger: Log4js.Logger = <any> new Logger();

  constructor(params = {}) {
    extend(this, params);
  }
}

export default Options;
