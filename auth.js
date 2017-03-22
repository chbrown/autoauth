#!/usr/bin/env node
const path = require('path');
const oauth = require('oauth');
const child_process = require('child_process');

class Client {
  constructor(request_token_url, access_token_url, login_url, verifier_js, key, secret) {
    this.OAuth = new oauth.OAuth(request_token_url, access_token_url, key, secret, '1.0A', null, 'HMAC-SHA1');
    this.login_url = login_url;
    this.verifier_js = verifier_js;
  }
  getRequestToken(callback) {
    this.OAuth.getOAuthRequestToken((err, oauth_request_token, oauth_request_token_secret) => {
      const url = this.login_url + oauth_request_token;
      console.info(`getRequestToken: oauth_request_token=${oauth_request_token},oauth_request_token_secret=${oauth_request_token_secret}`);
      return callback(err, {url, oauth_request_token, oauth_request_token_secret});
    });
  }
  verify(url, username, password, callback) {
    const cwd = path.join(__dirname, 'verifiers');
    const phantom_args = [this.verifier_js, url, username, password];
    const phantom_opts = {cwd, timeout: 15*1000}; // 15sec timeout
    console.info(`$ cd ${cwd}`);
    console.info(`$ phantomjs ${phantom_args.join(' ')}`);
    child_process.execFile('phantomjs', phantom_args, phantom_opts, (err, stdout, stderr) => {
      if (stderr) console.error(`phantomjs stderr: ${stderr}`);
      if (stdout) console.info(`phantomjs stdout: ${stdout}`);
      if (err) return callback(err);
      callback(null, stdout.trim());
    });
  }
  getAccessToken(request_token, request_token_secret, verifier, callback) {
    this.OAuth.getOAuthAccessToken(request_token, request_token_secret, verifier, (err, access_token, access_token_secret) => {
      console.info(`getAccessToken: access_token=${access_token},access_token_secret=${access_token_secret}`);
      callback(err, {access_token, access_token_secret});
    });
  }
  fullLogin(username, password, callback) {
    this.getRequestToken((err, {url, oauth_request_token, oauth_request_token_secret}) => {
      if (err) return callback(err);
      this.verify(url, username, password, (err, verifier) => {
        if (err) return callback(err);
        console.info(`fullLogin: verifier=${verifier}`);
        this.getAccessToken(oauth_request_token, oauth_request_token_secret, verifier, callback);
      });
    });
  }
}

const clients = {
  twitter(key, secret) {
    return new Client(
      'https://api.twitter.com/oauth/request_token?oauth_callback=oob',
      'https://api.twitter.com/oauth/access_token',
      'https://api.twitter.com/oauth/authorize?oauth_token=',
      'twitter.js', key, secret);
  },
  flickr(key, secret) {
    return new Client(
      'http://www.flickr.com/services/oauth/request_token',
      'http://www.flickr.com/services/oauth/access_token',
      // We could probably have perms=write below, just as well, but "delete" is a fuller permission set.
      'http://www.flickr.com/services/oauth/authorize?perms=delete&oauth_token=',
      'flickr.js', key, secret);
  },
};

function jsonCallback(err, obj) {
  if (err) {
    console.error(`autoauth: ${err.toString()}`);
  }
  else {
    console.log(JSON.stringify(obj));
  }
}

function main() {
  const usage = `
Convert login creds to OAuth creds!

Usage: node auth.js --appkey APP_KEY --appsecret APP_SECRET \\
          --username USERNAME --password PASSWORD
       node auth.js --appkey APP_KEY --appsecret APP_SECRET \\
          --reqtoken OAUTH_REQUEST_TOKEN --reqsecret OAUTH_REQUEST_TOKEN_SECRET --verifier PIN
`;
  const argv = require('optimist')
    .usage(usage)
    .demand(['appkey', 'appsecret', 'provider'])
    .argv;

  const client = clients[argv.provider](argv.appkey, argv.appsecret);
  if (argv.verifier) {
    // request_token, request_token_secret, and verifier are supplied
    client.getAccessToken(argv.reqtoken, argv.reqsecret, argv.verifier, jsonCallback);
  }
  else if (argv.username && argv.password) {
    client.fullLogin(argv.username, argv.password, jsonCallback);
  }
  else {
    // request token url only
    client.getRequestToken(jsonCallback);
  }
}

if (require.main === module) {
  main();
}

module.exports = clients;
