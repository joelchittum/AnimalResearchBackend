"use strict";

var MapsService = {
  /**
   *  This method gets all maps that are available to the public and
   * returns them as an array of json objects.
   */
  getPublicMaps: function(params, callback, sid, req, res) {
    var couchbase = require('couchbase');
    var cluster = new couchbase.Cluster('couchbase://' + process.env.COUCHSERVICE +
      '/');
    cluster.authenticate(process.env.USERNAME, process.env.PASSWORD);
    var bucket = cluster.openBucket(process.env.MAPSBUCKET);
    var SearchQuery = couchbase.ViewQuery;
    var query = SearchQuery.from('view', 'publicMap');

    bucket.query(query, function(err, rows) {
      if (err) {
        console.log('Some other error occurred: %j', err);
      } else {
        callback(null, rows);
      }
    });
  },

  /**
   *  This get method only grabs one map to be viewed in the map view
   * panel.  This method uses the mapName rather than the mapId.
   */
  getPublicMap: function(params, callback, sid, req, res) {
    var couchbase = require('couchbase');
    var cluster = new couchbase.Cluster('couchbase://' + process.env.COUCHSERVICE +
      '/');
    cluster.authenticate(process.env.USERNAME, process.env.PASSWORD);
    var bucket = cluster.openBucket(process.env.MAPSBUCKET);
    var SearchQuery = couchbase.ViewQuery;
    var query = SearchQuery.from('view', 'publicMap')
      .key(params.mapName);

    bucket.query(query, function(err, rows) {
      if (err) {
        console.log('Some other error occurred: %j', err);
      } else {
        callback(null, rows);
      }
    });
  },

  /**
   *  This method uses the decode token to get an array of map documents
   * the user is allowed to see then returns the array to the application.
   */
  getAuthorizedMaps: function(params, callback, sid, req, res) {
    var couchbase = require('couchbase');
    var jwt = require('jsonwebtoken');
    var fs = require('fs');
    var cluster = new couchbase.Cluster('couchbase://' + process.env.COUCHSERVICE +
      '/');
    cluster.authenticate(process.env.USERNAME, process.env.PASSWORD);
    var bucket = cluster.openBucket(process.env.MAPSBUCKET);
    var SearchQuery = couchbase.ViewQuery;
    SearchQuery.stale(couchbase.ViewQuery.Update.BEFORE)
    var cert = fs.readFileSync('server.key');
    var username = jwt.verify(params.token, cert)
      .user;
    var query = SearchQuery.from('view', 'authorizedMaps')
      .key(username);

    bucket.query(query, function(err, rows) {
      if (err) {
        console.log('Error Occured', err);
      } else {
        callback(null, rows);
      }
    });
  },

  /**
   *  This get method is to get only one document to view in the edit map
   * panel or in the map view panel.  It first decodes the username to
   * be used as a key then searches for the document and if found returns
   * it.  If a person is not authorized to see the map then the error
   * returned will be key does not exist.
   */
  getMap: function(params, callback, sid, req, res) {
    var couchbase = require('couchbase');
    var jwt = require('jsonwebtoken');
    var fs = require('fs');
    var cluster = new couchbase.Cluster('couchbase://' + process.env.COUCHSERVICE +
      '/');
    cluster.authenticate(process.env.USERNAME, process.env.PASSWORD);
    var bucket = cluster.openBucket(process.env.MAPSBUCKET);
    var SearchQuery = couchbase.ViewQuery;
    var cert = fs.readFileSync('server.key');
    var username = jwt.verify(params.token, cert)
      .user;
    var query = SearchQuery.from('view', 'getMapToView')
      .key([username, params.mapId]);

    bucket.query(query, function(err, rows) {
      if (err) {
        if (err.code == couchbase.errors.keyNotFound) {
          console.log('Key does not exist');
        } else {
          console.log('Some other error occurred: %j', err);
        }
      } else {
        callback(null, rows);
      }
    });
  },

  /**
   *  This delete method assures that the json web token was issued to the
   * owner of the map document before it allows a delete to happen.  It also
   * checks to make sure that the mapId exists in the database.
   */
  deleteDoc: function(params, callback, sid, req, res) {
    var couchbase = require('couchbase');
    var jwt = require('jsonwebtoken');
    var fs = require('fs');
    var cluster = new couchbase.Cluster('couchbase://' + process.env.COUCHSERVICE +
      '/');
    cluster.authenticate(process.env.USERNAME, process.env.PASSWORD);
    var bucket = cluster.openBucket(process.env.MAPSBUCKET);
    var SearchQuery = couchbase.ViewQuery;
    var cert = fs.readFileSync('server.key');
    var username = jwt.verify(params.token, cert)
      .user;
    var query = SearchQuery.from('view', 'getMapToView')
      .key([username, params.mapId]);

    bucket.query(query, function(err, rows) {
      if (err) {
        if (err.code == couchbase.errors.keyNotFound) {
          console.log('Key does not exist');
        } else {
          console.log('Some other error occurred: %j', err);
        }
      } else {
        if (username == rows[0].value.username && params.mapId ==
          rows[0].value.mapId) {
          callback(null, bucket.remove(params.mapId, function(error,
            result) {
            if (error) {
              console.log('Map does not exist');
            } else {
              callback(null, 'Map Deleted');
            }
          }));
        } else {
          console.log('You are not authorized to delete this map');
        }
      }
    });
  },

  /**
   *  This update method uses the json web token to validate the owner
   * of the map to be updated based on what is in the database.  It also
   * verifies that the mapId that is sent in does exist in the database.
   */
  updateDoc: function(params, callback, sid, req, res) {
    var couchbase = require('couchbase');
    var jwt = require('jsonwebtoken');
    var fs = require('fs');
    var cluster = new couchbase.Cluster('couchbase://' + process.env.COUCHSERVICE +
      '/');
    cluster.authenticate(process.env.USERNAME, process.env.PASSWORD);
    var bucket = cluster.openBucket(process.env.MAPSBUCKET);
    var SearchQuery = couchbase.ViewQuery;
    var cert = fs.readFileSync('server.key');
    var username = jwt.verify(params.token, cert)
      .user;
    var query = SearchQuery.from('view', 'getMapToView')
      .key([username, params.mapId]);

    bucket.query(query, function(err, rows) {
      if (err) {
        if (err.code == couchbase.errors.keyNotFound) {
          console.log('Key does not exist');
        } else {
          console.log('Some other error occurred: %j', err);
        }
      } else {
        if (username == rows[0].value.username && params.mapId ==
          rows[0].value.mapId) {
          callback(null, bucket.upsert(params.mapId, params.mapData,
            function(err, result) {
              if (err) {
                console.log('Some other error occurred: %j', err);
              } else {
                callback(null, result);
              }
            }));
        } else {
          console.log('You are not authorized to delete this map');
        }
      }
    });
  },

  /**
   *  This create method is used to create new maps and uses the json web
   *  token to define who the owner of the map is after the map doc is
   *  received.
   */
  createDoc: function(params, callback, sid, req, res) {
    var couchbase = require('couchbase');
    var jwt = require('jsonwebtoken');
    var fs = require('fs');
    var cluster = new couchbase.Cluster('couchbase://' + process.env.COUCHSERVICE +
      '/');
    cluster.authenticate(process.env.USERNAME, process.env.PASSWORD);
    var bucket = cluster.openBucket(process.env.MAPSBUCKET);
    var cert = fs.readFileSync('server.key');
    var username = jwt.verify(params.token, cert)
      .user;
    params.mapData.username = username;
    bucket.insert(params.mapId, params.mapData,
      function(err, result) {
        if (!err) {
          callback(null, result);
        } else {
          console.error("Couldn't store document: %j", err);
        }
      });
  } //,

  // updateSubDoc: function(params, callback, sid, req, res) {
  //   var couchbase = require('couchbase');
  //   var cluster = new couchbase.Cluster('couchbase://' + process.env.COUCHSERVICE +
  //     '/');
  //   cluster.authenticate(process.env.USERNAME, process.env.PASSWORD);
  //   var bucket = cluster.openBucket(process.env.MAPSBUCKET);
  //   var updateData = params.data;
  //   var updateStatement = 'bucket.mutateIn(params.docId)';
  //   var updateKeys = Object.keys(updateData);
  //
  //   for (var i = 0; i < updateKeys.length; i++) {
  //     var update;
  //
  //     if (typeof updateData[updateKeys[i]] == "string") {
  //       update = ('.upsert("' + updateKeys[i] + '","' + updateData[
  //           updateKeys[i]] +
  //         '")');
  //     } else {
  //       update = ('.upsert("' + updateKeys[i] + '",' + JSON.stringify(
  //         updateData[
  //           updateKeys[i]]) + ')');
  //     }
  //
  //     updateStatement = updateStatement + update;
  //   }
  //
  //   updateStatement = updateStatement +
  //     '.execute(function(err,frag){callback(null,frag)});';
  //
  //   eval(updateStatement);
  // }
};

module.exports = MapsService;

