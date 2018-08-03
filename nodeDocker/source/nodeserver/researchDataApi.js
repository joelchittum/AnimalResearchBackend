"use strict";

var DataService = {
  /**
   *  This method gets all data that are available to the public and
   * returns them as an array of json objects.
   */
  getPublicData: function(params, callback, sid, req, res) {
    var couchbase = require('couchbase');
    var cluster = new couchbase.Cluster('couchbase://' + process.env.COUCHSERVICE +
      '/');
    cluster.authenticate(process.env.USERNAME, process.env.PASSWORD);
    var bucket = cluster.openBucket(process.env.DATABUCKET);
    var SearchQuery = couchbase.ViewQuery;
    var query = SearchQuery.from('view', 'publicData');

    bucket.query(query, function(err, rows) {
      if (err) {
        console.log('Some other error occurred: %j', err);
      } else {
        callback(null, rows);
      }
    });
  },

  /**
   *  This method gets one static data object and returns it to the front end
   * application.
   */
  getStaticData: function(params, callback, sid, req, res) {
    var couchbase = require('couchbase');
    var cluster = new couchbase.Cluster('couchbase://' + process.env.COUCHSERVICE +
      '/');
    cluster.authenticate(process.env.USERNAME, process.env.PASSWORD);
    var bucket = cluster.openBucket(process.env.DATABUCKET);
    var SearchQuery = couchbase.ViewQuery;
    var query = SearchQuery.from('view', 'staticData')
      .key(params.dataName);

    bucket.query(query, function(err, rows) {
      if (err) {
        console.log('Some other error occurred: %j', err);
      } else {
        callback(null, rows);
      }
    });
  },

  /**
   *  This delete method assures that the json web token was issued to the
   * owner of the data document before it allows a delete to happen.  It also
   * checks to make sure that the dataId exists in the database.
   */
  deleteDataDoc: function(params, callback, sid, req, res) {
    var couchbase = require('couchbase');
    var jwt = require('jsonwebtoken');
    var fs = require('fs');
    var cluster = new couchbase.Cluster('couchbase://' + process.env.COUCHSERVICE +
      '/');
    cluster.authenticate(process.env.USERNAME, process.env.PASSWORD);
    var bucket = cluster.openBucket(process.env.DATABUCKET);
    var cert = fs.readFileSync('server.key');
    var username = jwt.verify(params.token, cert)
      .user;
    var query = SearchQuery.from('view', 'getData')
      .key([username, params.dataId]);

    bucket.query(query, function(err, rows) {
      if (err) {
        if (err.code == couchbase.errors.keyNotFound) {
          console.log('Key does not exist');
        } else {
          console.log('Some other error occurred: %j', err);
        }
      } else {
        if (username == rows[0].value.username && params.dataId ==
          rows[0].value.dataId) {
          callback(null, bucket.remove(params.dataId, function(error,
            result) {
            if (error) {
              console.log('This data Object does not exist');
            } else {
              callback(null, 'The data Object has been Deleted');
            }
          }));
        } else {
          console.log('You are not authorized to delete this data');
        }
      }
    });
  },

  /**
   *  This update method uses the json web token to validate the owner
   * of the data to be updated based on what is in the database.  It also
   * verifies that the dataId that is sent in does exist in the database.
   */
  updateDataDoc: function(params, callback, sid, req, res) {
    var couchbase = require('couchbase');
    var jwt = require('jsonwebtoken');
    var fs = require('fs');
    var cluster = new couchbase.Cluster('couchbase://' + process.env.COUCHSERVICE +
      '/');
    cluster.authenticate(process.env.USERNAME, process.env.PASSWORD);
    var bucket = cluster.openBucket(process.env.DATABUCKET);
    var cert = fs.readFileSync('server.key');
    var username = jwt.verify(params.token, cert)
      .user;
    var query = SearchQuery.from('view', 'getData')
      .key([username, params.dataId]);

    bucket.query(query, function(err, rows) {
      if (err) {
        if (err.code == couchbase.errors.keyNotFound) {
          console.log('Key does not exist');
        } else {
          console.log('Some other error occurred: %j', err);
        }
      } else {
        if (username == rows[0].value.username && params.dataId ==
          rows[0].value.dataId) {
          callback(null, bucket.upsert(
            function(err, result) {
              if (err) {
                console.log('Some other error occurred: %j', err);
              } else {
                callback(null, result);
              }
            }));
        } else {
          console.log('You are not authorized to delete this data');
        }
      }
    });
  },

  /**
   *  This create method is used to create new data and uses the json web
   *  token to define who the owner of the data is after the data doc is
   *  received.
   */
  createDataDoc: function(params, callback, sid, req, res) {
    var couchbase = require('couchbase');
    var jwt = require('jsonwebtoken');
    var fs = require('fs');
    var cluster = new couchbase.Cluster('couchbase://' + process.env.COUCHSERVICE +
      '/');
    cluster.authenticate(process.env.USERNAME, process.env.PASSWORD);
    var bucket = cluster.openBucket(process.env.DATABUCKET);
    var cert = fs.readFileSync('server.key');
    var username = jwt.verify(params.token, cert)
      .user;
    params.data.username = username;
    bucket.insert(params.dataId, params.data,
      function(err, result) {
        if (!err) {
          callback(null, result);
        } else {
          console.error("Couldn't store document: %j", err);
        }
      });
  },

  /**
   *  This method is written to change all the urls inside the data bucket
   * to make sure they all match what is necessary for the server it will be
   * deployed on.
   */
  updateURLString: function(params, callback, sid, req, res) {
    var couchbase = require('couchbase');
    var cluster = new couchbase.Cluster('couchbase://' + process.env.COUCHSERVICE +
      '/');
    cluster.authenticate(process.env.USERNAME, process.env.PASSWORD);
    var bucket = cluster.openBucket(process.env.DATABUCKET);
    var updateData = params.data;
    var updateKeys = Object.keys(updateData);

    var keys = params.keys;
    var values = params.values;

    for (var i = 0; i < keys.length; i++) {
      bucket.mutateIn(keys[i])
        .upsert('vectorTileUrl', values[i], true)
        .execute(function(err, frag) {
          callback(null, frag)
        });;
    }
  },

  getProjectLayerName: function(params, callback, sid, req, res) {
    var couchbase = require('couchbase');
    var cluster = new couchbase.Cluster('couchbase://' + process.env.COUCHSERVICE +
      '/');
    cluster.authenticate(process.env.USERNAME, process.env.PASSWORD);
    var bucket = cluster.openBucket(process.env.DATABUCKET);
    var SearchQuery = couchbase.ViewQuery;
    var query = SearchQuery.from('view', 'projectLayerName');

    bucket.query(query, function(err, rows) {
      if (err) {
        console.log('Some other error occurred: %j', err);
      } else {
        callback(null, rows);
      }
    });
  },

  /**
   *  This method is written to update meta data in the data docs for all
   * data in a given project.
   */
  updateMetaData: function(params, callback, sid, req, res) {
    var couchbase = require('couchbase');
    var cluster = new couchbase.Cluster('couchbase://' + process.env.COUCHSERVICE +
      '/');
    cluster.authenticate(process.env.USERNAME, process.env.PASSWORD);
    var bucket = cluster.openBucket(process.env.DATABUCKET);
    var key;

    for (var i = 0; i < params.values.length; i++) {
      key = params.values[i].id;

      bucket.mutateIn(key)
        .upsert('metaData', params.values[i].metaData, true)
        .execute(function(err, frag) {
          callback(null, frag)
        });
    }
  }
};

module.exports = DataService;

