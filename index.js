var webdriver = require('selenium-webdriver');
var chrome = require('selenium-webdriver/chrome');
var path = require('path');
var options = new chrome.Options();


//options.setChromeBinaryPath('/Users/sam/Downloads/chrome-mac/Chromium.app/Contents/MacOS/Chromium');

//expose gc to js
options.addArguments('--js-flags=--expose-gc');
options.setLoggingPrefs({performance: 'ALL'});
options.setPerfLoggingPrefs({enableTimeline: true});

var driver = new webdriver.Builder()
.forBrowser('chrome')
.setChromeOptions(options)
.build();

driver.get('file://' + path.join(__dirname, 'test/test.html'));
driver.sleep(1000);
driver.quit();
