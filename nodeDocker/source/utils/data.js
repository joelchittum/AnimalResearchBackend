/**
 *
 * @type {exports}
*/
var config = require('/server/utils/config');
var couchbase = require('couchbase');
var endPoint = config.database.endPoint;
var bucket = config.database.bucket;
var myCluster = new couchbase.Cluster(endPoint);
myCluster.authenticate(process.env.USERNAME, process.env.PASSWORD);
var db = myCluster.openBucket(bucket);

/**
 *
 * @param key
 * @param val
 * @param done
 */
function upsert(key, val, done) {
  db.upsert(key, val, function(err, res) {
    if (err) {
      done(err, null);
      return;
    }

    done(null, res);
  });
}

/**
 *
 * @param key
 * @param done
 */
function read(key, done) {
  db.get(key, function(err, result) {
    if (err) {
      done(err, null);
      return;
    }

    done(null, result);
  });
}

/**
 *
 * @param key
 * @param done
 */
function docDelete(key, done) {
  db.delete(key, function(err, result) {
    if (err) {
      done(err, null);
      return;
    }

    done(null, true);
  });
}

function refreshExpiry(key, time, done) {
  db.touch(key, time, function(err, result) {
    if (err) {
      return done(err, null);
    }

    done(null, true);
  });
}

/**
 *
 * @param sql
 * @param user
 * @param done
 */
function query(sql, user, done) {
  // Init a channel
  var channel;

  // Check for only 2 parameters and if only 2 assign the callback correctly
  //   Otherwise, assign channel to the username passed in for publishing using Faye
  if (typeof done === "undefined") {
    done = user;
  } else {
    channel = user;
  }

  // Setup Query
  var N1qlQuery = couchbase.N1qlQuery;

  // Make a N1QL specific Query
  var query = N1qlQuery.fromString(sql);

  // Issue Query
  db.query(query, function(err, result) {
    if (err) {
      done(err, null);
      return;
    }

    done(null, result);
  });
}

/**
 *
 * @param done
 */

module.exports.ODMBucket = db;
module.exports.endPoint = endPoint;
module.exports.bucket = bucket;
module.exports.query = query;
module.exports.delete = docDelete;
module.exports.read = read;
module.exports.upsert = upsert;
module.exports.refreshExpiry = refreshExpiry;

