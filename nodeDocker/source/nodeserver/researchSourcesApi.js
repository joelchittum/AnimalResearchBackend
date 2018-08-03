"use_strict";

var Service = {
  /**
   *  This get method gets the data sources array
   */
  getDataSources: function(params, callback, sid, req, res) {
    var couchbase = require('couchbase');
    var cluster = new couchbase.Cluster('couchbase://' + process.env.COUCHSERVICE +
      '/');
    cluster.authenticate(process.env.USERNAME, process.env.PASSWORD);
    var bucket = cluster.openBucket(process.env.SOURCESBUCKET);
    var SearchQuery = couchbase.ViewQuery;
    var query = SearchQuery.from('view', 'dataSources');

    bucket.query(query, function(err, rows) {
      if (err) {
        console.log('Some other error occurred: %j', err);
      } else {
        callback(null, rows);
      }
    });
  }
}

module.exports = Service

