# Node Distributed Timer
A simple module to set and clear timers using Redis for persistence

## Setup
The timer object requires tasks to be defined during initialization. These tasks are then matched by name during job execution regardless of which node executes the job. An outline of the full config is below:

```javascript
var Timer = require('node-distributed-timer');

var Timer = new Timer({
  connection: {
    host: '127.0.0.1',
    port: 6379
  }
  prefix: 'timer',
  ttl: 2000,
  tasks: {},
  logger: logger
});
```

## API
### `new Timer(options: Object)`
Creates a new timer instance. All option keys are optional.
- `options.connection`: Connection config is passed straight into ioredis, full options at https://github.com/luin/ioredis/blob/master/API.md#new-redisport-host-options
- `options.prefix`: (default: timer) Redis key prefix
- `options.ttl`: (default: 2000) Job execution timeout (milliseconds) before releasing the Redis lock
- `options.tasks`: Map of task/function pairs used for job execution (see demo.js for an example)
- `options.logger`: Logger for internal logging

### `timer.schedule(task: String, id: String, timeout: Number)`
Schedules a new job.
- `task`: Task to run on completion, must exist within `options.tasks`
- `id`: ID of the job, will be passed into the associated task method as the only parameter
- `timeout`: Time in milliseconds before the job will execute

### `timer.clear(task: String, id: String)`
Clears an existing task.
- `task`: Task of the scheduled job
- `id`: ID of the scheduled job
