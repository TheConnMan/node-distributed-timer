var Timer = require('./index');
var uuid = require('node-uuid');

var log4js = require('log4js');
var logger = log4js.getLogger();

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
