#!/usr/bin/env phantomjs
/*jslint node: true, browser: true */ /*globals phantom, $ */
var system = require('system');
var webpage = require('webpage');
var url = system.args[1];
var screenname = system.args[2];
var password = system.args[3];
var page = webpage.create();
var EXPECT = 'login'; // EXPECT should cycle through 'login' and then 'done'
var jquery_url = '//cdnjs.cloudflare.com/ajax/libs/jquery/1.9.1/jquery.min.js';

page.viewportSize = { width: 960, height: 800 };
page.settings.userAgent = 'Mozilla/4.0 (compatible; MSIE 5.0; Windows NT 5.1; .NET CLR 1.1.4322)';
page.onLoadFinished = function(status) {
  // console.log('Expect: ' + EXPECT + ', Status: ' + status);
  if (EXPECT === 'login') {
    page.includeJs(jquery_url, function() {
      EXPECT = 'allow';

      page.evaluate(function(opts) {
        $('input[name="session[username_or_email]"]:visible:first').val(opts.screenname).trigger('keydown');
        var $pw = $('input[name="session[password]"]:visible:first').val(opts.password).trigger('keydown');
        var $form = $pw.closest('form:visible').trigger('keydown');
        setTimeout(function() {
          $form.trigger('submit');
        }, Math.random() * 250 + 250);
      }, {screenname: screenname, password: password});
    });
  }
  else if (EXPECT === 'allow') {
    page.includeJs(jquery_url, function() {
      EXPECT = 'done';

      page.evaluate(function() {
        $('#allow').trigger('click');
      });
    });
  }
  else if (EXPECT === 'done') {
    EXPECT = 'finished';
    if (page.content.match(/something has gone awry/)) {
      console.log('invalid login');
      phantom.exit(1);
    }
    else {
      var pin_code = page.evaluate(function() {
        return document.getElementsByTagName('code')[0].textContent; // #oauth_pin code
      });
      console.log(pin_code);
      phantom.exit(0);
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
