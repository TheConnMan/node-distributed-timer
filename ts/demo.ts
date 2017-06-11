import Timer from './Timer';
import * as uuid from 'node-uuid';

import * as Log4js from 'log4js';
var logger = Log4js.getLogger();

var timer = new Timer({
  logger: logger,
  tasks: {
    log: function(id) {
      logger.info('Completed task ' + id);
    }
  }
});

setInterval(function() {
  timer.schedule('log', uuid.v4(), 5000);
}, 5000);
