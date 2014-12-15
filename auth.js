#!/usr/bin/env node
/*jslint node: true */
var logger = require('loge');
var path = require('path');
var util = require('util');
var oauth = require('oauth');
var child_process = require('child_process');

var verifiers_path = path.join(__dirname, 'verifiers');
function verify(verifier_js, url, username, password, callback) {
  // callback signature (err, request_token, request_token_secret, verifier)
  var phantom_args = [verifier_js, url, username, password];
  var phantom_opts = {cwd: verifiers_path, timeout: 15*1000}; // 15sec timeout
  logger.info('$ cd %s', verifiers_path);
  logger.info('$ phantomjs %s', phantom_args.join(' '));
  child_process.execFile('phantomjs', phantom_args, phantom_opts, function(err, stdout, stderr) {
    if (stderr) logger.error('phantomjs stderr: %s', stderr);
    if (stdout) logger.info('phantomjs stdout: %s', stdout);
    if (err) return callback(err);
    callback(null, stdout.trim());
  });
}

function Client(request_token_url, access_token_url, login_url, verifier_js, key, secret) {
  this.OAuth = new oauth.OAuth(request_token_url, access_token_url, key, secret, '1.0A', null, 'HMAC-SHA1');
  this.login_url = login_url;
  this.verifier_js = verifier_js;
}
Client.prototype.getAccessToken = function(request_token, request_token_secret, verifier, callback) {
  this.OAuth.getOAuthAccessToken(request_token, request_token_secret, verifier, function(err, access_token, access_token_secret) {
    if (callback) {
      callback(err, {access_token: access_token, access_token_secret: access_token_secret});
    }
    else {
      if (err) {
        logger.error("Auto OAuth authentication process failed");
        logger.error(util.inspect(err, {showHidden: true, depth: 7}));
      }
      else {
        logger.info('access_token=' + access_token + ',access_token_secret=' + access_token_secret);
      }
    }
  });
};
Client.prototype.fullLogin = function(username, password, callback) {
  var self = this;
  this.OAuth.getOAuthRequestToken(function(err, oauth_request_token, oauth_request_token_secret) {
    logger.info('request_token=' + oauth_request_token + ',request_token_secret=' + oauth_request_token_secret);
    var url = self.login_url + oauth_request_token;
    // oauth_request_token, oauth_request_token_secret,
    verify(self.verifier_js, url, username, password, function(err, verifier) {
      if (callback && err) {
        return callback(err);
      }
      if (!callback) {
        logger.info('Got verifier: ' + verifier);
      }
      self.getAccessToken(oauth_request_token, oauth_request_token_secret, verifier, callback);
    });
  });
};

var clients = {
  twitter: function(key, secret) {
    return new Client('https://twitter.com/oauth/request_token',
      'https://twitter.com/oauth/access_token',
      'https://twitter.com/oauth/authorize?oauth_token=',
      'twitter.js', key, secret);
  },
  flickr: function(key, secret) {
    return new Client('http://www.flickr.com/services/oauth/request_token',
      'http://www.flickr.com/services/oauth/access_token',
      // We could probably have perms=write below, just as well, but "delete" is a fuller permission set.
      'http://www.flickr.com/services/oauth/authorize?perms=delete&oauth_token=',
      'flickr.js', key, secret);
  },
};

if (require.main === module) {
  var argv = require('optimist')
    .usage('Convert login creds to OAuth creds!\n' +
      'Usage: $0 --appkey APP_KEY --appsecret APP_SECRET \\\n' +
      '  --username USERNAME --password PASSWORD\n' +
      'Or: $0 --appkey APP_KEY --appsecret APP_SECRET \\\n' +
      '  --reqtoken OAUTH_REQUEST_TOKEN --reqsecret OAUTH_REQUEST_TOKEN_SECRET --verifier PIN')
    .demand(['appkey', 'appsecret', 'provider'])
    .argv;

  var client = clients[argv.provider](argv.appkey, argv.appsecret);
  if (argv.verifier) {
    // request_token, request_token_secret, and verifier are supplied
    client.getAccessToken(argv.reqtoken, argv.reqsecret, argv.verifier);
  }
  else {
    client.fullLogin(argv.username, argv.password);
  }
}

module.exports = clients;
