// var autobahn = require('autobahn');
var moment = require('moment');
var _ = require('lodash');

const Poloniex = require('poloniex-api-node');
let poloniex = new Poloniex();

var track = function(currencies, store) {
  _.each(currencies, function(currency) {
    poloniex.subscribe(currency);
  });

  poloniex.on('message', (channelName, data, seq) => {
        _.each(data, function(element) {
          var toSend;
          var data = element.data;
          if (element.type === 'orderBookModify') {
            // rate: '0.02516071', amount: '119.22000000'
            var rate = parseFloat(data.rate);
            var amount = parseFloat(data.amount);
            toSend = {
              index: 'poloniex-' + moment().format('YYYY.MM.DD'),
              type: data.type,
              body: {
                '@timestamp': new Date(),
                rate: rate,
                amount: amount,
                total: amount * rate,
                currency: channelName
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
                currency: channelName
              }
            };
          }

          if (toSend) {
            store.write(toSend);
          }
        });


  });

  poloniex.on('open', () => {
    console.log(`Poloniex WebSocket connection open`);
  });

  poloniex.on('close', (reason, details) => {
    console.log(`Poloniex WebSocket connection disconnected`);
    poloniex.openWebSocket({ version: 2 });
  });

  poloniex.on('error', (error) => {
    console.log(`An error has occured`);
  });

  poloniex.openWebSocket({ version: 2 });

  // connection.onopen = function(session) {
  //   console.log('open');
  //   function marketEvent(args, kwargs) {
  //     console.log(args);

  //

  //
  //     });
  //   }
  //
  // };
  //
  // connection.onclose = function() {
  //   console.log("Websocket connection closed");
  // };
  //
  // connection.open();
};


module.exports = {
  track: track
};
