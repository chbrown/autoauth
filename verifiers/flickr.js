#!/usr/bin/env phantomjs
'use strict'; /*jslint nomen: true, node: true, indent: 2, debug: true, vars: true, es5: true */
var system = require('system');
var webpage = require('webpage');
var url = system.args[1];
var username = system.args[2];
var password = system.args[3];
var page = webpage.create();
var EXPECT = 'login'; // EXPECT should cycle through 'login' and then 'done'

page.viewportSize = { width: 960, height: 800 };
page.settings.userAgent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_8_3) ' +
  'AppleWebKit/537.31 (KHTML, like Gecko) Chrome/26.0.1410.65 Safari/537.31';
page.onLoadFinished = function(status) {
  // console.log('Rendering: ' + EXPECT + '-' + Date.now() + '.png');
  // page.render(EXPECT + '-' + Date.now() + '.png');

  if (page.content.match(/window.location.replace/)) {
    return;
  }

  if (EXPECT === 'login') {
    EXPECT = 'authorize';

    page.evaluate(function(opts) {
      var username = document.querySelector('#username');

      var mousedown_event = document.createEvent('MouseEvents');
      mousedown_event.initMouseEvent('mousedown', true, false);
      username.dispatchEvent(mousedown_event);
      username.value = opts.username;

      var blur_event = document.createEvent('UIEvents');
      blur_event.initUIEvent('blur', true, false);
      username.dispatchEvent(blur_event);

      document.querySelector('#passwd').value = opts.password;

      var save = document.querySelector('#\\.save');
      var click_event = document.createEvent('MouseEvents');
      click_event.initMouseEvent('click', true, false);
      save.dispatchEvent(click_event);
    }, {username: username, password: password});
  }
  else if (EXPECT === 'authorize') {
    EXPECT = 'callback';
    if (page.content.match(/wants to link to your Flickr account/)) {
      page.evaluate(function() {
        document.querySelector('[value~="AUTHORIZE"]').click();
      });
    }
    else {
      console.log('invalid login');
      setTimeout(function() {
        phantom.exit(1);
      }, 1000);
    }
  }
  else if (EXPECT === 'callback') {
    EXPECT = 'done';

    var querystring = page.evaluate(function() {
      return window.location.search;
    });
    var verifier_match = querystring.match(/oauth_verifier=(\w+)/);

    if (verifier_match) {
      console.log(verifier_match[1]);
      phantom.exit(0);
    }
    else {
      console.log('invalid callback url');
      phantom.exit(1);
    }
  }
  else {
    console.log('That state, ' + EXPECT + ', is not recognized! Exiting in 5s.');
    setTimeout(function() {
      phantom.exit(111);
    }, 5000);
  }
};

page.open(url);
