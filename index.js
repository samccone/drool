var webdriver = require('selenium-webdriver');
var chrome = require('selenium-webdriver/chrome');
var path = require('path');
var options = new chrome.Options();


//options.setChromeBinaryPath('/Users/sam/Downloads/chrome-mac/Chromium.app/Contents/MacOS/Chromium');

//expose gc to js
options.addArguments('--js-flags=--expose-gc');
options.setLoggingPrefs({performance: 'ALL'});
options.setPerfLoggingPrefs({
  'traceCategories': 'blink.console,disabled-by-default-devtools.timeline'
  //Fix found here https://github.com/cabbiepete/browser-perf/commit/046f65f02db418c17ec2d59c43abcc0de642a60f
  // related to bug https://code.google.com/p/chromium/issues/detail?can=2&start=0&num=100&q=&colspec=ID%20Pri%20M%20Week%20ReleaseBlock%20Cr%20Status%20Owner%20Summary%20OS%20Modified&groupby=&sort=&id=474667
  //enableTimeline: true
});

var driver = new webdriver.Builder()
.forBrowser('chrome')
.setChromeOptions(options)
.build();

driver.get('file://' + path.join(__dirname, 'test/test.html'));
driver.sleep(1000);
driver.quit();
