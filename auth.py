#!/usr/bin/env python
import argparse
import urlparse
import oauth2 as oauth
import subprocess

def sh(args):
    print '$ %s' % ' '.join(args)
    return subprocess.check_output(args)

class OAuthProvider(object):
    def __init__(self, app_key, app_secret):
        self.consumer = oauth.Consumer(app_key, app_secret)
        self.client = oauth.Client(self.consumer)

    def get_access_token(self, username, password):
        resp, content = self.client.request(self.request_token_url, 'GET')
        if resp['status'] != '200':
            raise Exception('Invalid response %s.' % resp['status'])

        request_token = dict(urlparse.parse_qsl(content))

        print 'Request token:', request_token
        login_url = '%s?oauth_token=%s' % (self.authorize_url, request_token['oauth_token'])
        print 'Opening url in phantomjs:', login_url

        oauth_verifier = sh(['phantomjs', 'twitter.js', login_url, username, password])
        print 'Got back verifier:', oauth_verifier

        token = oauth.Token(request_token['oauth_token'], request_token['oauth_token_secret'])
        token.set_verifier(oauth_verifier.strip())
        self.client = oauth.Client(self.consumer, token)

        resp, content = self.client.request(self.access_token_url, 'POST')
        access_token = dict(urlparse.parse_qsl(content))

        print 'Access Token:', access_token

        return access_token

class Twitter(OAuthProvider):
    request_token_url = 'https://twitter.com/oauth/request_token'
    access_token_url = 'https://twitter.com/oauth/access_token'
    authorize_url = 'https://twitter.com/oauth/authorize'
    phantomjs = 'twitter.js'


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Convert login creds to oAuth creds!')
    parser.add_argument('--provider', type=str, default='twitter')
    parser.add_argument('--key', '-k', type=str, required=True)
    parser.add_argument('--secret', '-s', type=str, required=True)
    parser.add_argument('--username', '-u', type=str, required=True)
    parser.add_argument('--password', '-p', type=str, required=True)

    opts = parser.parse_args()

    app = None
    if opts.provider == 'twitter':
        app = Twitter(opts.key, opts.secret)

    access_token = app.get_access_token(opts.username, opts.password)

    print
    from pprint import pprint
    pprint(access_token)
