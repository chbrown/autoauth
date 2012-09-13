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

# License

Copyright 2012 Christopher Brown, [MIT Licensed](http://gifl.me/MIT License)