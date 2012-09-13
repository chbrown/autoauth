#!/usr/bin/env phantomjs
var system = require('system'),
  webpage = require('webpage');

var url = system.args[1],
  screenname = system.args[2],
  password = system.args[3],
  page = webpage.create(),
  EXPECT = 'login'; // EXPECT should cycle through 'login' and then 'done'

page.viewportSize = { width: 960, height: 800 };
page.settings.userAgent = 'Mozilla/4.0 (compatible; MSIE 5.0; Windows NT 5.1; .NET CLR 1.1.4322)';

page.onLoadFinished = function(status) {
  // console.log('Expect: ' + EXPECT + ', Status: ' + status);
  if (EXPECT === 'login') {
    page.includeJs("https://ajax.googleapis.com/ajax/libs/jquery/1.8.0/jquery.min.js", function() {
      EXPECT = 'done';

      page.evaluate(function(opts) {
        $('input[name="session[username_or_email]"]:visible:first')
          .val(opts.screenname).trigger('keydown');
        var $pw = $('input[name="session[password]"]:visible:first')
          .val(opts.password).trigger('keydown');
        var $form = $pw.closest('form:visible').trigger('keydown');

        setTimeout(function() {
          $form.trigger('submit');
        }, 1000);
      }, {screenname: screenname, password: password});
    });
  }
  else if (EXPECT === 'done') {
    EXPECT = 'finished';
    page.includeJs("https://ajax.googleapis.com/ajax/libs/jquery/1.8.0/jquery.min.js", function() {
      var pin_code = page.evaluate(function() {
        return $('#oauth_pin code').text();
      });
      console.log(pin_code);
      phantom.exit(0);
    });
  }
  else {
    console.log('That state, ' + EXPECT + ', is not recognized! Exiting in 10s.');
    setTimeout(function() {
      phantom.exit(111);
    }, 10000);
  }
};

page.open(url);
