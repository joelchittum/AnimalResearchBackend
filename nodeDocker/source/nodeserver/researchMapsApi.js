"use strict";

var AnimalService = {
  /**
   *  This method gets all docs that are available to the public and
   * returns them as an array of json objects.
   */
  getAnimals: function(params, callback, sid, req, res) {
    var couchbase = require('couchbase');
    var cluster = new couchbase.Cluster('couchbase://' + process.env.COUCHSERVICE +
      '/');
    cluster.authenticate(process.env.USERNAME, process.env.PASSWORD);
    var bucket = cluster.openBucket(process.env.ANIMALBUCKET);
    var SearchQuery = couchbase.ViewQuery;
    var query = SearchQuery.from('view', 'animals');

    bucket.query(query, function(err, rows) {
      if (err) {
        console.log('Some other error occurred: %j', err);
      } else {
        callback(null, rows);
      }
    });
  },

  /**
   *  This get method only grabs one animal to be viewed in the animal view
   * panel.  This method uses the docName rather than the id.
   */
  getAnimal: function(params, callback, sid, req, res) {
    var couchbase = require('couchbase');
    var cluster = new couchbase.Cluster('couchbase://' + process.env.COUCHSERVICE +
      '/');
    cluster.authenticate(process.env.USERNAME, process.env.PASSWORD);
    var bucket = cluster.openBucket(process.env.ANIMALBUCKET);
    var SearchQuery = couchbase.ViewQuery;
    var query = SearchQuery.from('view', 'animals')
      .key(params.docName);

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
   * owner of the document before it allows a delete to happen.  It also
   * checks to make sure that the id exists in the database.
   */
  deleteDoc: function(params, callback, sid, req, res) {
    var couchbase = require('couchbase');
    var jwt = require('jsonwebtoken');
    var fs = require('fs');
    var cluster = new couchbase.Cluster('couchbase://' + process.env.COUCHSERVICE +
      '/');
    cluster.authenticate(process.env.USERNAME, process.env.PASSWORD);
    var bucket = cluster.openBucket(process.env.ANIMALBUCKET);
    var SearchQuery = couchbase.ViewQuery;
    var cert = fs.readFileSync('server.key');
    var username = jwt.verify(params.token, cert)
      .user;
    var query = SearchQuery.from('view', 'animalUpdate')
      .key([username, params.id]);

    bucket.query(query, function(err, rows) {
      if (err) {
        if (err.code == couchbase.errors.keyNotFound) {
          console.log('Key does not exist');
        } else {
          console.log('Some other error occurred: %j', err);
        }
      } else {
        if (username == rows[0].value.username && params.id ==
          rows[0].value.id) {
          callback(null, bucket.remove(params.id, function(error,
            result) {
            if (error) {
              console.log('Doc does not exist');
            } else {
              callback(null, 'Doc Deleted');
            }
          }));
        } else {
          console.log('You are not authorized to delete this Doc');
        }
      }
    });
  },

  /**
   *  This update method uses the json web token to validate the owner
   * of the animal to be updated based on what is in the database.  It also
   * verifies that the id that is sent in does exist in the database.
   */
  updateDoc: function(params, callback, sid, req, res) {
    var couchbase = require('couchbase');
    var jwt = require('jsonwebtoken');
    var fs = require('fs');
    var cluster = new couchbase.Cluster('couchbase://' + process.env.COUCHSERVICE +
      '/');
    cluster.authenticate(process.env.USERNAME, process.env.PASSWORD);
    var bucket = cluster.openBucket(process.env.ANIMALBUCKET);
    var SearchQuery = couchbase.ViewQuery;
    var cert = fs.readFileSync('server.key');
    var username = jwt.verify(params.token, cert)
      .user;
    var query = SearchQuery.from('view', 'animalUpdate')
      .key([username, params.id]);

    bucket.query(query, function(err, rows) {
      if (err) {
        if (err.code == couchbase.errors.keyNotFound) {
          console.log('Key does not exist');
        } else {
          console.log('Some other error occurred: %j', err);
        }
      } else {
        if (username == rows[0].value.username && params.id ==
          rows[0].value.id) {
          callback(null, bucket.upsert(params.id, params.data,
            function(err, result) {
              if (err) {
                console.log('Some other error occurred: %j', err);
              } else {
                callback(null, result);
              }
            }));
        } else {
          console.log('You are not authorized to delete this doc');
        }
      }
    });
  },

  /**
   *  This create method is used to create new docs and uses the json web
   *  token to define who the owner of the animal is after the animal doc is
   *  received.
   */
  createDoc: function(params, callback, sid, req, res) {
    var couchbase = require('couchbase');
    var jwt = require('jsonwebtoken');
    var fs = require('fs');
    var cluster = new couchbase.Cluster('couchbase://' + process.env.COUCHSERVICE +
      '/');
    cluster.authenticate(process.env.USERNAME, process.env.PASSWORD);
    var bucket = cluster.openBucket(process.env.ANIMALBUCKET);
    var cert = fs.readFileSync('server.key');
    var username = jwt.verify(params.token, cert)
      .user;
    params.data.username = username;
    bucket.insert(params.id, params.data,
      function(err, result) {
        if (!err) {
          callback(null, result);
        } else {
          console.error("Couldn't store document: %j", err);
        }
      });
  } ,

  updateSubDoc: function(params, callback, sid, req, res) {
    var couchbase = require('couchbase');
    var cluster = new couchbase.Cluster('couchbase://' + process.env.COUCHSERVICE +
      '/');
    cluster.authenticate(process.env.USERNAME, process.env.PASSWORD);
    var bucket = cluster.openBucket(process.env.ANIMALBUCKET);
    var updateData = params.data;
    var updateStatement = 'bucket.mutateIn(params.docId)';
    var updateKeys = Object.keys(updateData);

    for (var i = 0; i < updateKeys.length; i++) {
      var update;

      if (typeof updateData[updateKeys[i]] == "string") {
        update = ('.upsert("' + updateKeys[i] + '","' + updateData[
            updateKeys[i]] +
          '")');
      } else {
        update = ('.upsert("' + updateKeys[i] + '",' + JSON.stringify(
          updateData[
            updateKeys[i]]) + ')');
      }

      updateStatement = updateStatement + update;
    }

    updateStatement = updateStatement +
      '.execute(function(err,frag){callback(null,frag)});';

    eval(updateStatement);
  }
};

module.exports = AnimalService;
