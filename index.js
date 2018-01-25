var tracker = require('./tracker');
var winston = require('winston');
var _ = require('lodash');
var config = require('config');

winston.remove(winston.transports.Console);
winston.add(winston.transports.Console, {
  'timestamp': true
});

var markets = config.get('markets');
var store = require('./'+config.get('store'));

tracker.track(markets,store);
