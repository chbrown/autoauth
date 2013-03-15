#!/usr/bin/env node
var winston = require('winston');
var oauth = require('oauth');
var child_process = require('child_process');

var oauth_providers = {
  twitter: function(key, secret, username, password, callback) {
    // callback signature (err, access_token, access_secret)
    var client = new oauth.OAuth('https://twitter.com/oauth/request_token', 'https://twitter.com/oauth/access_token',
      key, secret, '1.0A', null, 'HMAC-SHA1');
    client.getOAuthRequestToken(function(err, oauth_request_token, oauth_request_token_secret, result) {
      if (err) callback(err);
      var login_url = 'https://twitter.com/oauth/authorize?oauth_token=' + oauth_request_token;
      var phantom_args = ['twitter.js', login_url, username, password];
      var phantom_opts = {cwd: __dirname, timeout: 15*1000}; // 15sec timeout
      winston.info('$ phantomjs ' + phantom_args.join(' '));
      child_process.execFile('phantomjs', phantom_args, phantom_opts, function(err, verifier, stderr) {
        if (stderr) winston.error('phantomjs stderr: ' + stderr);
        if (err) {
          // die fast
          callback(err);
        }
        else {
          var pin = verifier.trim();
          winston.info('Got pin: ' + pin);
          client.getOAuthAccessToken(oauth_request_token, oauth_request_token_secret, pin, function(err, oauth_access_token, oauth_access_token_secret, result) {
            callback(err, oauth_access_token, oauth_access_token_secret);
          });
        }
      });
    });
  }
};

if (require.main === module) {
  var argv = require('optimist')
    .default({provider: 'twitter'})
    .usage('Convert login creds to oAuth creds!\n' +
      'Usage: $0 --key CONSUMER_KEY --secret CONSUMER_SECRET --user SERVICE_USERNAME --password SERVICE_PASSWORD')
    .demand(['key', 'secret', 'user', 'password'])
    .argv;

  var provider = oauth_providers[argv.provider];
  provider(argv.key, argv.secret, argv.user, argv.password, function(err, access_token, access_token_secret) {
    if (err) {
      winston.error("Auto oAuth authentication process failed");
      winston.error(err);
    }
    else {
      winston.info('access_token=' + access_token + ',access_secret=' + access_token_secret);
    }
  });
}

module.exports = oauth_providers;
