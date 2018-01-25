var elasticsearch = require('elasticsearch');

var client = new elasticsearch.Client({
  host: 'elasticsearch:9200',
  log: 'info'
});

module.exports = {
  write: function (toSend) {
    console.log(toSend);
    client.create(toSend, function(error, response) {
      if(error) {
        console.log(error);
      } else {
        console.log(error);
      }
    });
  }
};
