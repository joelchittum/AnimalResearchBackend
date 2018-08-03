"use strict";

var LoginService = {
  /**
   *  This login method accepts a generated token from the application.
   * Then this token is decrypted and verified then it generates a new
   * token and returns it to the application for validation of users to
   * allow docs to be modified, created and deleted.
   */
  login: function(params, callback, sid, req, res) {
    var jwt = require('jsonwebtoken');
    var fs = require('fs');
    var node_cryptojs = require('node-cryptojs-aes');
    var atob = require('atob');
    var fs = require('fs');
    var CryptoJS = node_cryptojs.CryptoJS;
    var cert = fs.readFileSync('/server/server.key');

    var payload = JSON.parse(atob(params.token.split(".")[1]));
    var header = JSON.parse(atob(params.token.split(".")[0]));

    var decrypted = CryptoJS.AES.decrypt(params.token.split(".")[2],
      'thisisonlyatest');
    var decrypted_str = CryptoJS.enc.Utf8.stringify(decrypted);
    var signature = {
      "payload": JSON.parse(atob(decrypted_str.split(".")[1])),
      "header": JSON.parse(atob(decrypted_str.split(".")[0]))
    };

    if (signature.payload.username == payload.username && signature.payload
      .iss == payload.iss) {
      var token = jwt.sign({
        user: signature.payload.username
      }, cert, {
        expiresIn: '3d'
      });
      callback(null, token);
    }
  }
};

module.exports = LoginService;

