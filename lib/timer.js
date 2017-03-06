var Redis = require('ioredis');
var Redlock = require('redlock');
var extend = require('extend');

var logger = require('./logger');

module.exports = Timer;

var defaultOptions = {
  prefix: 'timer',
  ttl: 2000,
  connection: {
    showFriendlyErrorStack: true
  },
  tasks: {},
  logger: logger
};


function Timer(overrides) {
  var options = extend(true, {}, defaultOptions, overrides || {});
  var dbNumber = options.connection && options.connection.db || 0;

  this.ttl = options.ttl;
  this.tasks = options.tasks;
  this.prefix = options.prefix;
  this.logger = options.logger;

  this.tasks.log = this.tasks.log || function(id) {
    options.logger.info('Completed task ' + id);
  };

  this.client = new Redis(options.connection);
  this.subscriber = new Redis(options.connection);
  this.redlock = new Redlock([this.client], { retryCount: 0 });

  this.subscriber.config('SET', 'notify-keyspace-events', 'Ex');
  this.subscriber.subscribe('__keyevent@' + dbNumber + '__:expired');

  this.subscriber.on('message', (channel, message) => {
    var start = this.prefix + ':work:';
    if (!message.startsWith(start)) return;

    var job = message.slice(start.length).split(':');

    if (this.tasks[job[0]]) {
      this.process(job[0], job[1]);
    } else {
      this.logger.error('No task by the name ' + job[0] + ' exists, skipping job ' + job[1]);
    }
  });
}

Timer.prototype.process = function(task, id) {
  this.logger.debug('Processing job ' + id);
  var fn = this.tasks[task];
  this.redlock.lock(this.getLockKey(task, id), this.ttl).then(function(lock) {
    fn(id);
    lock.unlock();
  }, function() {
    return (null);
  });
};

Timer.prototype.schedule = function(task, id, timeout) {
  this.logger.debug('Scheduling job ' + id + ' with timeout ' + timeout);
  return this.client.set(this.getLockKey(task, id), id, 'PX', timeout, 'NX');
};

Timer.prototype.clear = function(task, id) {
  this.logger.info('Clearing job ' + id);
  this.client.del(this.getJobKey(task, id));
};

Timer.prototype.getLockKey = function(task, id) {
  return this.prefix + ':work:' + task + ':' + id;
};
