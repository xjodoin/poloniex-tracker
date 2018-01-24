var autobahn = require('autobahn');
var moment = require('moment');
var _ = require('lodash');
var elasticsearch = require('elasticsearch');

var client = new elasticsearch.Client({
  host: 'elasticsearch:9200',
  log: 'info'
});

var track = function(currency) {
  var wsuri = "wss://api.poloniex.com";
  var connection = new autobahn.Connection({
    url: wsuri,
    realm: "realm1"
  });

  connection.onopen = function(session) {
    function marketEvent(args, kwargs) {
      _.each(args, function(element) {
        var toSend;
        var data = element.data;
        if (element.type === 'orderBookModify') {
          // rate: '0.02516071', amount: '119.22000000'
          toSend = {
            index: 'poloniex-' + moment().format('YYYY.MM.DD'),
            type: data.type,
            body: {
              '@timestamp': new Date(),
              rate: parseFloat(data.rate),
              amount: parseFloat(data.amount),
              currency: currency
            }
          };
        } else if (element.type === 'newTrade') {
          // { amount: '1.00000000',
          //   date: '2016-03-18 20:54:01',
          //   rate: '0.02490201',
          //   total: '0.02490201',
          //   tradeID: '5074296',
          //   type: 'sell' } }
          toSend = {
            index: 'poloniex-' + moment().format('YYYY.MM.DD'),
            type: data.type,
            body: {
              '@timestamp': new Date(),
              rate: parseFloat(data.rate),
              amount: parseFloat(data.amount),
              total: parseFloat(data.total),
              currency: currency
            }
          };
        }

        if (toSend) {
          client.create(toSend, function(error, response) {});
        }

      });
    }

    session.subscribe(currency, marketEvent);
  };

  connection.onclose = function() {
    console.log("Websocket connection closed");
  };

  connection.open();
};


module.exports = {
  track: track
};
