var autobahn = require('autobahn');
var moment = require('moment');
var _ = require('lodash');
var elasticsearch = require('elasticsearch');

var client = new elasticsearch.Client({
  host: 'elasticsearch.weave.local:9200',
  log: 'info'
});


var wsuri = "wss://api.poloniex.com";
var connection = new autobahn.Connection({
  url: wsuri,
  realm: "realm1"
});

connection.onopen = function(session) {
  function marketEvent(args, kwargs) {
    _.each(args,function (element) {
      var toSend;
      var data = element.data;
      if(element.type === 'orderBookModify') {
        // rate: '0.02516071', amount: '119.22000000'
        toSend = {
          index: 'poloniex_btc_eth-'+moment().format('YYYY.MM.DD'),
          type: data.type,
          body: {
            '@timestamp': new Date(),
            rate: parseFloat(data.rate),
            amount: parseFloat(data.amount)
          }
        };
      }
      else  if(element.type === 'newTrade') {
        // { amount: '1.00000000',
        //   date: '2016-03-18 20:54:01',
        //   rate: '0.02490201',
        //   total: '0.02490201',
        //   tradeID: '5074296',
        //   type: 'sell' } }
        toSend = {
          index: 'poloniex_btc_eth-'+moment().format('YYYY.MM.DD'),
          type: data.type,
          body: {
            '@timestamp': new Date(),
            rate: parseFloat(data.rate),
            amount: parseFloat(data.amount),
            total: parseFloat(data.total)
          }
        };
      }

      if(toSend) {
        client.create(toSend, function(error, response) {});
      }

    });
  }
  // [ 'BTC_ETH',
  //   '0.03116279',
  //   '0.03116248',
  //   '0.03115600',
  //   '0.00525291',
  //   '29970.17965690',
  //   '940939.75068520',
  //   0,
  //   '0.03319990',
  //   '0.03029000' ]
  // currencyPair, last, lowestAsk, highestBid, percentChange, baseVolume, quoteVolume, isFrozen, 24hrHigh, 24hrLow
  function tickerEvent(args, kwargs) {

    if(args[0] === 'BTC_ETH') {
      // [logstash-]YYYY.MM.DD
      client.create({
        index: 'poloniex_btc_eth-'+moment().format('YYYY.MM.DD'),
        type: 'ticker',
        body: {
          '@timestamp': new Date(),
          last: parseFloat(args[1]),
          lowestAsk: parseFloat(args[2]),
          highestBid: parseFloat(args[3]),
          percentChange: parseFloat(args[4]),
          baseVolume: parseFloat(args[5]),
          quoteVolume: parseFloat(args[6]),
          isFrozen: args[7],
          '24hrHigh': parseFloat(args[8]),
          '24hrLow': parseFloat(args[9])
        }
      }, function(error, response) {
      });
    }

  }

  function trollboxEvent(args, kwargs) {
    console.log(args);
  }
  session.subscribe('BTC_ETH', marketEvent);
  session.subscribe('ticker', tickerEvent);
  //session.subscribe('trollbox', trollboxEvent);
};

connection.onclose = function() {
  console.log("Websocket connection closed");
};

connection.open();
