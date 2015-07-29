var assert = require('assert');
var webdriver = require('selenium-webdriver');
var drool = require('../lib/');
var path = require('path');
var config = {
  chromeOptions: 'no-sandbox'
};

describe('memory tests', function() {
  beforeEach(function() {
    if (typeof process.env.chromeBinaryPath !== 'undefined') {
      config.chromeBinaryPath = process.env.chromeBinaryPath;
    }

    this.results = [];
    this.driver = drool.start(config);
  });

  afterEach(function() {
    return this.driver.quit();
  });

  it('inputs should not leak when added and removed', function() {
    this.driver.get('file://' + path.join(__dirname, 'examples/', 'inputs.html'));

    drool.getCounts(this.driver)
    .then(this.results.push.bind(this.results));

    for (var i = 0; i < 20; ++i) {
      this.driver.findElement(webdriver.By.css('#add-remove')).click();
    }

    return drool.getCounts(this.driver)
    .then(function(data) {
      assert.equal(this.results[0].nodes, data.nodes,
          'node count should match');
    }.bind(this));
  });

  it('shows leaks', function() {
    this.driver.get('file://' + path.join(__dirname, 'examples/', 'leaking.html'));
    drool.getCounts(this.driver)
    .then(this.results.push.bind(this.results));

    for (var i = 0; i < 4; ++i) {
      this.driver.findElement(webdriver.By.css('#leak')).click();
    }

    drool.getCounts(this.driver)
    .then(function(data) {
      assert.notEqual(this.results[0].nodes, data.nodes, 'node count does not match');
    }.bind(this));

    this.driver.findElement(webdriver.By.css('#clean')).click();

    return drool.getCounts(this.driver)
    .then(function(data) {
      assert.equal(this.results[0].nodes, data.nodes, 'node count does not grow');
    }.bind(this));
  });
});
