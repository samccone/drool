var webdriver = require('selenium-webdriver');
var leaky = require('../lib/');
var path = require('path');
var assert = require('assert');
var results = [];

var driver = leaky.start({
  chromeOptions: 'no-sandbox',
  chromeBinaryPath: '/home/travis/build/samccone/leaky/chrome-linux/chrome'
});

driver.get('file://' + path.join(__dirname, 'inputs.html'));

leaky.getCounts(driver)
.then(results.push.bind(results));

for (var i = 0; i < 100; ++i) {
  driver.findElement(webdriver.By.css('#add-remove')).click();
}

leaky.getCounts(driver)
.then(function(data) {
  assert.equal(results[0].nodes, data.nodes, 'node count does not match');
});

driver.quit();
