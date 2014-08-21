#!/usr/bin/env phantomjs
/*jslint node: true, browser: true */ /*globals phantom, $ */
var system = require('system');
var webpage = require('webpage');
var url = system.args[1];
var screenname = system.args[2];
var password = system.args[3];
var email = system.args[4];
var page = webpage.create();
var jquery_url = '//cdnjs.cloudflare.com/ajax/libs/jquery/1.9.1/jquery.min.js';

page.viewportSize = { width: 960, height: 800 };
page.settings.userAgent = 'Mozilla/4.0 (compatible; MSIE 5.0; Windows NT 5.1; .NET CLR 1.1.4322)';
page.onLoadFinished = function(status) {
  if (page.content.match(/session\[username_or_email\]/)) {
    page.includeJs(jquery_url, function() {

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
  else if (page.content.match(/id="allow"/)) {
    page.includeJs(jquery_url, function() {

      page.evaluate(function() {
        $('#allow').trigger('click');
      });
    });
  }
  else if (page.content.match(/email_challenge_submit/)) {
    page.includeJs(jquery_url, function() {

      page.evaluate(function(opts) {
        var $email = $('#challenge_response').val(opts.email).trigger('keydown');
        var $form = $email.closest('form:visible').trigger('keydown');
        setTimeout(function() {
          $form.trigger('submit');
        }, Math.random() * 250 + 250);
      }, {email: email});
    });
  }
  else if (page.content.match(/id="oauth_pin"/)) {
    var pin_code = page.evaluate(function() {
      return document.getElementsByTagName('code')[0].textContent; // #oauth_pin code
    });
    console.log(pin_code);
    phantom.exit(0);
  }
  else if (page.content.match(/something has gone awry/)) {
    console.log('invalid login');
    phantom.exit(1);
  }
  else {
    console.log('unknown page : ' + page.content);
    setTimeout(function() {
      phantom.exit(111);
    }, 5000);
  }
};

page.open(url);
