var elasticsearch = require('elasticsearch');

var client = new elasticsearch.Client({
  host: 'elasticsearch:9200',
  log: 'info'
});

module.exports = {
  write: function (toSend) {
    client.index(toSend, function(error, response) {});
  }
};
