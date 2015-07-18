var assert = require('assert');
var webdriver = require('selenium-webdriver');
var leaky = require('../lib/');
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
    this.driver = leaky.start(config);
  });

  afterEach(function() {
    return this.driver.quit();
  });

  it('inputs should not leak when added and removed', function() {
    this.driver.get('file://' + path.join(__dirname, 'examples/', 'inputs.html'));

    leaky.getCounts(this.driver)
    .then(this.results.push.bind(this.results));

    for (var i = 0; i < 20; ++i) {
      this.driver.findElement(webdriver.By.css('#add-remove')).click();
    }

    return leaky.getCounts(this.driver)
    .then(function(data) {
      assert.equal(this.results[0].nodes, data.nodes,
          'node count should match');
    }.bind(this));
  });

  it('should not leak on initial typing', function() {
    this.driver.get('file://' + path.join(__dirname, 'examples/', 'input_typeAndClear.html'));

    leaky.getCounts(this.driver)
    .then(this.results.push.bind(this.results));

    this.driver.findElement(webdriver.By.css('input')).sendKeys('A');

    return leaky.getCounts(this.driver)
    .then(function(data) {
      assert.equal(this.results[0].nodes, data.nodes,
          'node count should match');
    }.bind(this))
  });

  it('should not leak on typing and clearing', function() {
    this.driver.get('file://' + path.join(__dirname, 'examples/', 'input_typeAndClear.html'));

    leaky.getCounts(this.driver)
    .then(this.results.push.bind(this.results));

    for (var i = 0; i < 5; ++i) {
      get.call(this,  'input').sendKeys('Baz');
      get.call(this, '#clear').click();
    }
    function get(selector) {
      return this.driver.findElement(webdriver.By.css(selector)); 
    }

    return leaky.getCounts(this.driver)
    .then(function(data) {
      assert.equal(this.results[0].nodes, data.nodes,
          'node count should match');
    }.bind(this));
  });

  it('shows leaks', function() {
    this.driver.get('file://' + path.join(__dirname, 'examples/', 'leaking.html'));
    leaky.getCounts(this.driver)
    .then(this.results.push.bind(this.results));

    for (var i = 0; i < 4; ++i) {
      this.driver.findElement(webdriver.By.css('#leak')).click();
    }

    leaky.getCounts(this.driver)
    .then(function(data) {
      assert.notEqual(this.results[0].nodes, data.nodes, 'node count does not match');
    }.bind(this));

    this.driver.findElement(webdriver.By.css('#clean')).click();

    return leaky.getCounts(this.driver)
    .then(function(data) {
      assert.equal(this.results[0].nodes, data.nodes, 'node count does not grow');
    }.bind(this));
  });
});
