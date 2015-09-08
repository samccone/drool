var webdriver = require('selenium-webdriver');
var chrome = require('selenium-webdriver/chrome');
var controlFlow = webdriver.promise.controlFlow();

function executeInFlow(fn) {
  if (typeof fn === 'function') {
    return controlFlow.execute(fn);
  }

  return controlFlow.execute(function() {});
}

function getCounts(driver, prev) {
  return getLastCounts(driver).then(function(counts) {
    return driver.executeScript('gc()')
    .then(function() {
      if (!prev || counts.jsHeapSizeUsed < prev.jsHeapSizeUsed) {
        return getCounts(driver, counts);
      }

      return counts;
    });
  });
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

function flow(set, driver) {
  var initial = [];
  set.repeatCount = (typeof set.repeatCount === 'undefined') ? 5 : set.repeatCount;

  executeInFlow(set.setup);

  // prewarm the cache
  executeInFlow(set.action);

  getCounts(driver)
  .then(initial.push.bind(initial));

  for (var i = 0; i < set.repeatCount; ++i) {
    executeInFlow(set.action);
  }

  executeInFlow(set.beforeAssert);

  getCounts(driver)
  .then(function(data) {
    set.assert(data, initial[0]);
  });

  return executeInFlow(set.exit);
}

function start(opts) {
  opts = opts || {};

  var options = new chrome.Options();

  if (typeof opts.chromeBinaryPath !== 'undefined') {
    options.setChromeBinaryPath(opts.chromeBinaryPath);
  }

  ['--js-flags=--expose-gc'].concat(opts.chromeOptions || []).forEach(function(v) {
    options.addArguments(v);
  });

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
  flow: flow,
  getCounts: getCounts,
  webdriver: webdriver
};
