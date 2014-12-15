#!/usr/bin/env phantomjs
/*jslint node: true, browser: true */ /*globals phantom */
var system = require('system');
var webpage = require('webpage');
var url = system.args[1];
var screen_name = system.args[2];
var password = system.args[3];
var page = webpage.create();
var EXPECT = 'login'; // EXPECT should cycle through 'login' and then 'done'
// var jquery_url = '//cdnjs.cloudflare.com/ajax/libs/jquery/1.9.1/jquery.min.js';

page.viewportSize = { width: 960, height: 800 };
page.settings.userAgent = 'Mozilla/4.0 (compatible; MSIE 5.0; Windows NT 5.1; .NET CLR 1.1.4322)';
page.onLoadFinished = function(status) {
  // console.error('Expect: ' + EXPECT + ', Status: ' + status);
  if (EXPECT === 'login') {
    EXPECT = 'done';

    page.evaluate(function(opts) {
      var keydown_event = document.createEvent('KeyboardEvent');
      keydown_event.initEvent('keydown', true, true);

      var screen_name_input = document.querySelector('input[name="session[username_or_email]"]');
      screen_name_input.value = opts.screen_name;
      screen_name_input.dispatchEvent(keydown_event);

      var password_input = document.querySelector('input[name="session[password]"]');
      password_input.value = opts.password;
      password_input.dispatchEvent(keydown_event);

      var submit_button = document.querySelector('#allow');
      setTimeout(function() {
        var click_event = document.createEvent('MouseEvent');
        click_event.initEvent('click', true, true);
        submit_button.dispatchEvent(click_event);
      }, Math.random() * 250 + 250);
    }, {screen_name: screen_name, password: password});
  }
  else if (EXPECT === 'done') {
    if (page.content.match(/something has gone awry/)) {
      EXPECT = 'finished';
      console.error('invalid login');
      phantom.exit(1);
    }
    else if (page.content.match(/enter this PIN to complete the authorization process/)) {
      EXPECT = 'finished';
      var pin_code = page.evaluate(function() {
        return document.querySelector('code').textContent; // #oauth_pin code
      });
      console.log(pin_code);
      phantom.exit(0);
    }
    else {
      // EXPECT = 'done'; // stays the same
      page.evaluate(function(opts) {
        var submit_button = document.querySelector('#allow');
        setTimeout(function() {
          var click_event = document.createEvent('MouseEvent');
          click_event.initEvent('click', true, true);
          submit_button.dispatchEvent(click_event);
        }, Math.random() * 250 + 250);
      });
    }
  }
  else {
    console.error('That state, %s, is not recognized! Exiting in 5s.', EXPECT);
    setTimeout(function() {
      phantom.exit(111);
    }, 5000);
  }
};

page.open(url);
