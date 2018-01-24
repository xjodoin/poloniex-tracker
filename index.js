var tracker = require('./tracker');
var winston = require('winston');
var _ = require('lodash');
var config = require('config');

winston.remove(winston.transports.Console);
winston.add(winston.transports.Console, {
  'timestamp': true
});

var markets = config.get('markets');

_.forEach(markets, function(key) {
    winston.info('Launch tracker for ' + key);
    tracker.track(key);
});
