var webdriver = require('selenium-webdriver');
var chrome = require('selenium-webdriver/chrome');
var path = require('path');

function getCounts(driver) {
  driver.executeScript('gc()');

  return getLastCounts(driver);
}

function getLastCounts(driver) {
  return (new webdriver.WebDriver.Logs(driver))
  .get('performance')
  .then(function(v) {
    var d = v.filter(function(v) {
      return JSON.parse(v.message).message.params.name === 'UpdateCounters';
    }).pop();

    return JSON.parse(d.message).message.params.args.data;
  });
}

function start() {
  var options = new chrome.Options();
  //expose gc to js
  options.addArguments('--js-flags=--expose-gc');
  options.setLoggingPrefs({performance: 'ALL'});
  options.setPerfLoggingPrefs({
    'traceCategories': 'blink.console,disabled-by-default-devtools.timeline'
    //Fix found here https://github.com/cabbiepete/browser-perf/commit/046f65f02db418c17ec2d59c43abcc0de642a60f
    // related to bug https://code.google.com/p/chromium/issues/detail?can=2&start=0&num=100&q=&colspec=ID%20Pri%20M%20Week%20ReleaseBlock%20Cr%20Status%20Owner%20Summary%20OS%20Modified&groupby=&sort=&id=474667
    //enableTimeline: true
  });

  return new webdriver.Builder()
  .forBrowser('chrome')
  .setChromeOptions(options)
  .build();
}

module.exports = {
  start: start,
  getCounts: getCounts
};
