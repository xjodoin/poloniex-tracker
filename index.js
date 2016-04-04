var plnx = require('plnx');
var tracker = require('./tracker');
var winston = require('winston');
var _ = require('lodash');
winston.remove(winston.transports.Console);
winston.add(winston.transports.Console, {
  'timestamp': true
});


plnx.return24Volume({}, function(err, data) {
  if (err) {
    winston.error(err);
    return;
  }
  var toTracks = _.pickBy(data, function(value, key) {
    return key.indexOf('BTC_') === 0;
  });

  _.forEach(toTracks, function(track, key) {
    if (track.BTC > 100) {
      winston.info('Launch tracker for ' + key);
      tracker.track(key);
    }

  });

});
