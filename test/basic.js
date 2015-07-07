var webdriver = require('selenium-webdriver');
var leaky = require('../lib/');
var path = require('path');
var results = [];

var driver = leaky.start({
  chromeOptions: 'no-sandbox',
  chromeBinaryPath: '/home/travis/build/samccone/leaky/chrome-linux/chrome'
});

driver.get('file://' + path.join(__dirname, 'test.html'));

leaky.getCounts(driver)
.then(console.log.bind(console));

driver.findElement(webdriver.By.css('#leak')).click();
driver.findElement(webdriver.By.css('#leak')).click();
driver.findElement(webdriver.By.css('#leak')).click();
driver.findElement(webdriver.By.css('#leak')).click();

leaky.getCounts(driver)
.then(console.log.bind(console));

driver.findElement(webdriver.By.css('#clean')).click();

leaky.getCounts(driver)
.then(console.log.bind(console));

driver.quit();
