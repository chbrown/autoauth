# Introduction to OAuth

[![autoauth npm version](https://badge.fury.io/js/autoauth.svg)](https://www.npmjs.com/package/autoauth)

OAuth is a messy process that puts a proxy between your user account and some service.
It's a many-to-many relationship, usually called an "App," and allows you to set access restrictions between your user account (full access) and what the App can access.

For example, you may have a protected Twitter account, but want a service to archive the tweets of everyone you follow. You would give this service read access, so that it could see who you're following, but you wouldn't let it tweet for you or send your followers direct messages. But let's say you want your Wordpress to automatically tweet for you when you create a new post, with a link to the blog post. In that case, you would give the service write access, to tweet on your behalf.

More and more services are requiring OAuth for all connections, as a way of simplifying the API.
I guess that's admirable, though I wouldn't say necessary.
OAuth is kind of annoying from a developer's point of view (and yours, apparently, if you're here).
I have a lot of accounts that I meticulously created, but I still can't use them directly; I have to wrap them in OAuth to use the API.

`AutoAuth`, this repository, intends to make it easy for you to create such a wrapper with the least amount of pain.
The goal is full read & write access, as close to full user account credentials as is possible given the particular endpoint (Twitter, Flickr, Facebook, etc.)

In general, the process works like this:

1. You create an "App" on the endpoint, i.e., Twitter. This is done on the endpoint's website. This App usually comes with an App Key and an App Secret. Most likely, it will only ever have one user: your personal account.
2. You then add your user to this App via `AutoAuth`. This will result in another pair of credentials, an OAuth Access Token and OAuth Access Token Secret.
3. You can now use these credentials to access the target service and manipulate your account as desired, using whatever client API library you like.

To recap, the goal is (usually) to end up with four credentials:

* App key
* App secret
* Access token
* Access token secret


## Prerequisites for all endpoints:

1. [PhantomJS](https://github.com/ariya/phantomjs/)!

On Mac OS X:

````bash
brew install phantomjs
````

2. `oauth` and `optimist` and `loge`

````bash
npm install
````


# Twitter

1. Go to https://dev.twitter.com/apps/new
2. Fill it out
3. On your app page there'll be a "Consumer key" and a "Consumer secret" -- copy these down for later. These are the App Key and App Secret, but Twitter just gives them fancy names.

Your personal Twitter account will have a pre-formed access token and secret at the bottom of the page, but I take it you're going to be authenticating multiple accounts programmatically. Otherwise, those should work just fine (and you don't need this `AutoAuth` script at all).


# Flickr

1. Go to http://www.flickr.com/services/apps/create/apply/ (also linked from http://www.flickr.com/services/apps/)
2. Select the non-commericial option
3. Give your app a name (not important) and some details.
4. The next page should show you a "Key" like `52a351d5ca79a57d26d3ace89d2a8e1d` and a "Secret" like `cd68f50112d1cb57`. These are important! Keep them handy. They are your "App Key" and "App Secret."
5. "Edit the authentication flow" for this app, and set the callback url to some random URL that won't redirect. I use `http://henrian.com/`, for example.

Then simply run `auth.js` with the App Key and App Secret values as `--appkey` and `--secret` arguments, `--username` and `--password` with your account credentials. And, of course, `--provider flickr`.

*Disclaimer:* Yahoo! is requiring a captcha from me, just to log in, so this isn't currently working as it ought to.
For the time being, simply run the script, use the url it generates (put it in the browser and follow the instructions, then copy the verifier bit in the querystring. Re-run `auth.js` with `--reqtoken` and `--reqsecret` set to the output from the previous run of `auth.js`, and `--verifier` to that bit from the URL.

If you know how to get around that captcha issue, let me know. It's probably some JS trigger that I'm missing in the verifier script. Damn you web 2.0.


### Developing other providers

Each new service requires a new phantomjs module in `verifiers/` and some
additions to the clients hash in `auth.js`.


## Running the auth.js script:

You'll run the `auth.js` script, replacing your username and password with actual values:

```bash
node auth.js --provider twitter \
  --appkey xkNtpnwJdmbSE6uDH0vsF --appsecret hqgCs6kzXfaHT5pS8GdyEo93V04QMUI7u2JtxcZKB1N \
  --username thisisnotme --password r5Q4cERliu
```

That is just the command line interface. You can also use the Node.js library as a module!

```javascript
const autoauth = require('autoauth');

const key = 'xkNtpnwJdmbSE6uDH0vsF';
const secret = 'hqgCs6kzXfaHT5pS8GdyEo93V04QMUI7u2JtxcZKB1N';
const user = 'thisisnotme';
const password = 'r5Q4cERliu';

autoauth.twitter(key, secret).fullLogin(user, password, (err, credentials) => {
  if (err)
    console.log("WTF!", err);
  else
    console.log("Got the user's credentials!", credentials.access_token, credentials.access_token_secret);
});
```

## License

Copyright © 2012-2013, 2017 Christopher Brown.
[MIT Licensed](https://chbrown.github.io/licenses/MIT/#2012-2013,2017).
