import * as Redis from 'ioredis';
import * as Redlock from 'redlock';
import * as extend from 'extend';
import * as Log4js from 'log4js';

import Options from './lib/Options';

class Timer {

  private options: Options;

  private dbNumber: number;
  private client: Redis.Redis;
  private subscriber: Redis.Redis;
  private redlock: Redlock;

  constructor(overrides) {
    this.options = new Options(overrides);

    this.dbNumber = this.options.connection && this.options.connection.db || 0;
    this.client = new Redis(this.options.connection);
    this.subscriber = new Redis(this.options.connection);
    this.redlock = new Redlock([this.client], { retryCount: 0 });

    this.subscriber.config('SET', 'notify-keyspace-events', 'Ex');
    this.subscriber.subscribe('__keyevent@' + this.dbNumber + '__:expired');

    this.subscriber.on('message', (channel, message) => {
      var start = this.options.prefix + ':work:';
      if (!message.startsWith(start)) return;

      var job = message.slice(start.length).split(':');

      if (this.options.tasks[job[0]]) {
        this.process(job[0], job[1]);
      } else {
        this.options.logger.error('No task by the name ' + job[0] + ' exists, skipping job ' + job[1]);
      }
    });
  }

  private process(task, id): void {
    this.options.logger.debug('Processing job ' + id);
    var fn = this.options.tasks[task];
    this.redlock.lock(this.getLockKey(task, id), this.options.ttl).then(function(lock) {
      fn(id);
      lock.unlock();
    }, function() {
      return (null);
    });
  }

  public schedule(task, id, timeout): boolean {
    this.options.logger.debug('Scheduling job ' + id + ' with timeout ' + timeout);
    return this.client.set(this.getLockKey(task, id), id, 'PX', timeout, 'NX');
  }

  public clear(task, id): void {
    this.options.logger.info('Clearing job ' + id);
    this.client.del(this.getLockKey(task, id));
  }

  private getLockKey(task, id): string {
    return this.options.prefix + ':work:' + task + ':' + id;
  }
}

export default Timer;
