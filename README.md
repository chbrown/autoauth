# Basic credentials to OAuth tokens

OAuth is kind of annoying from a developer's point of view. I have a lot of
accounts that I meticulously created, but I still can't use them until I wrap
them in OAuth security. I think OAuth is one good idea that is outweighed by so
many other unnecessary complications that it isn't much of a good idea anymore.

Still, devs will be devs, and OAuth is not going anywhere, so here we are:

### Developing a tool to produce OAuth tokens from a username and password.

Currently, I only have Twitter done. Basically, each new service that this
needs to suppose will require a new phantomjs module and some special urls
in the `OAuthProvider` class in `auth.py`. Not sure how best to manage that
modularity at the moment, but for now, since Twitter is all *I* need, a flat
file structure suffices.

## Prerequisites:

1. [PhantomJS](https://github.com/ariya/phantomjs/)!

````bash
brew install phantomjs
````

2. `oauth` and `optimist` and `winston`

````bash
npm install
````

## Getting cred:

1. Go to https://dev.twitter.com/apps/new
2. Fill it out
3. On your app page there'll be a "Consumer key" and a "Consumer secret" -- copy these down for later:

````bash
# assuming you're in bash:
export CONSUMER_KEY=xkNtpnwJdmbSE6uDH0vsF
export CONSUMER_SECRET=hqgCs6kzXfaHT5pS8GdyEo93V04QMUI7u2JtxcZKB1N
````

Your personal Twitter account will have a pre-formed access token and secret at the bottom of the page, but I take it your going to be authenticating multiple accounts, so you don't need those now.

## Running the auth.js script:

Now, with those `bash` environment variables set, run the `auth.js` script, replacing your username and password with actual values:

````bash
node auth.js \
  --key $CONSUMER_KEY --secret $CONSUMER_SECRET \
  --user thisisnotme --password r5Q4cERliu
````

This is just the command line interface. You can also use the Node.js lib as a module!

````javascript
var autoauth = require('autoauth');
var key = process.env.CONSUMER_KEY, secret = process.env.CONSUMER_SECRET;
var user = 'thisisnotme', password = 'r5Q4cERliu';
autoauth.twitter(key, secret, user, password,
  function(err, access_token, access_token_secret) {
  if (err)
    console.log("WTF!", err);
  else
    console.log("Got the user's credentials!", access_token, access_token_secret);
});
````

# License

Copyright 2012 Christopher Brown, [MIT Licensed](http://gifl.me/MIT License)
