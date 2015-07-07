var webdriver = require('selenium-webdriver');
var leaky = require('../lib/');
var path = require('path');
var assert = require('assert');
var results = [];

var driver = leaky.start({
  chromeOptions: 'no-sandbox',
  chromeBinaryPath: '/home/travis/build/samccone/leaky/chrome-linux/chrome'
});

driver.get('file://' + path.join(__dirname, 'test.html'));

leaky.getCounts(driver)
.then(results.push.bind(results));

driver.findElement(webdriver.By.css('#leak')).click();
driver.findElement(webdriver.By.css('#leak')).click();
driver.findElement(webdriver.By.css('#leak')).click();
driver.findElement(webdriver.By.css('#leak')).click();

leaky.getCounts(driver)
.then(function(data) {
  assert.notEqual(results[0].nodes, data.nodes, "node count does not match");
});

driver.findElement(webdriver.By.css('#clean')).click();

leaky.getCounts(driver)
.then(function(data) {
  assert.equal(results[0].nodes, data.nodes, "node count does not grow");
});

driver.quit();
