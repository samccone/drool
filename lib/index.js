var webdriver = require('selenium-webdriver');
var chrome = require('selenium-webdriver/chrome');
var controlFlow = webdriver.promise.controlFlow();
var driverErrorMessage = 'Please provide a driver (as returned' +
' by drool.start) as the second argument to drool.flow';

function executeInFlow(fn) {
  if (typeof fn === 'function') {
    return controlFlow.execute(fn);
  }

  return controlFlow.execute(function() {});
}

function getCounts(driver, prev) {
  return getLastCounts(driver, prev).then(function(lastCounts) {
    return driver.executeScript('gc()')
    .then(function() {
      if (!prev) {
        console.log('requerying counts to make sure they make sense');
        return getCounts(driver, lastCounts);
      } else if (!prev.counts) {
        console.log('no counts in previous logs - requerying');
        return getCounts(driver, lastCounts);
      } else if (!lastCounts.counts) {
        console.log('no counts in logs - requerying');
        return getCounts(driver, prev);
      } else if (lastCounts.counts.jsHeapSizeUsed < prev.counts.jsHeapSizeUsed) {
        console.log('heap is still decreazing - requerying after delay', [lastCounts.counts.jsHeapSizeUsed, prev.counts.jsHeapSizeUsed]);
        return driver.sleep(100).then(() => getCounts(driver, lastCounts));
      }
      console.log('counts are allright');
      return lastCounts;
    });
  });
}

function getLastCounts(driver, last) {
  last = last || {};

  return driver.manage().logs().get('performance')
  .then(function(performanceLogs) {
    last.gc = (last.gc === undefined ? sumGcCounts(performanceLogs, last.gc) : last.gc);
    var d = performanceLogs.filter(function(v) {
      return JSON.parse(v.message).message.params.name === 'UpdateCounters';
    }).pop();

		var counts = d ? JSON.parse(d.message).message.params.args.data : null;

    return {
      counts: counts,
      gc: last.gc
    };
  });
}

function sumGcCounts(traces, last) {
  last = last || {MinorGC: {
    count: 0,
    duration: 0,
  }, MajorGC: {
    count: 0,
    duration: 0,
  }, 'V8.GCScavenger': {
    count: 0,
    duration: 0,
  }, 'V8.GCIncrementalMarking': {
    count: 0,
    duration: 0,
  }};

  return traces.reduce(function(prev, val) {
    var params = JSON.parse(val.message).message.params;
    var name = params.name;

    ['V8.GCScavenger',
    'V8.GCIncrementalMarking',
    'MajorGC',
    'MinorGC'].forEach(function(v) {
      if (name === v) {
        if (params.ph === 'B') {
          prev[v]._start = params.ts;
        } else {
          if (prev[v]._start) {
            prev[v].count++;
            prev[v].duration += params.ts - (prev[v]._start);
            delete prev[v]._start;
          }
        }
      }
    });

    return prev;
  }, last);
}

function flow(set, driver) {
  var initialCounts;
  if (!driver) { throw new Error(driverErrorMessage); }
  set = Object.assign({repeatCount: 5, prewarmRepeatCount: 1}, set);

  executeInFlow(set.setup);

  // prewarm the cache
  console.log('warming up');
  for (var i = 0; i < set.prewarmRepeatCount; ++i) {
    executeInFlow(set.action);
  }

  executeInFlow(set.afterPrewarm).then(() => {
    console.log('getting initial counts');
    getCounts(driver)
      .then(data => initialCounts = data)
      .then(() => console.log('main testing'));
  });

  for (var i = 0; i < set.repeatCount; ++i) {
    executeInFlow(set.action);
  }

  var afterCounts;

  executeInFlow(set.beforeAssert)
    .then(() => {
      console.log('getting result counts');
      return getCounts(driver)
    })
    .then(data => afterCounts = data)
    .then(function() {
      return executeInFlow(set.exit)
    })
    .then(function() {
      set.assert(afterCounts, initialCounts);
    })
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
    'traceCategories': 'v8,blink.console,disabled-by-default-devtools.timeline'
    //jscs:disable
    //Fix found here https://github.com/cabbiepete/browser-perf/commit/046f65f02db418c17ec2d59c43abcc0de642a60f
    // related to bug https://code.google.com/p/chromium/issues/detail?can=2&start=0&num=100&q=&colspec=ID%20Pri%20M%20Week%20ReleaseBlock%20Cr%20Status%20Owner%20Summary%20OS%20Modified&groupby=&sort=&id=474667
    //enableTimeline: true
    //jscs:enable
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
