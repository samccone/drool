var assert = require('assert');
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
    var self = this;

    return drool.flow({
      setup: function() {
        self.driver.get('file://' + path.join(__dirname, 'examples/', 'inputs.html'));
      },
      action: function() {
        self.driver.findElement(drool.webdriver.By.css('#add-remove')).click();
      },
      assert: function(after, initial) {
        assert.equal(initial.nodes, after.nodes, 'node count should match');
      }
    }, self.driver);
  });

  it('shows leaks', function() {
    var self = this;

    return drool.flow({
      setup: function() {
        self.driver.get('file://' + path.join(__dirname, 'examples/', 'leaking.html'));
      },
      action: function() {
        self.driver.findElement(drool.webdriver.By.css('#leak')).click();
      },
      assert: function(after, initial) {
        assert.notEqual(initial.nodes, after.nodes, 'node count should not match');
      }
    }, self.driver);
  });

  it('gcs correctly', function() {
    var self = this;

    return drool.flow({
      setup: function() {
        self.driver.get('file://' + path.join(__dirname, 'examples/', 'leaking.html'));
      },
      action: function() {
        self.driver.findElement(drool.webdriver.By.css('#leak')).click();
      },
      beforeAssert: function() {
        self.driver.findElement(drool.webdriver.By.css('#clean')).click();
      },
      assert: function(after, initial) {
        // This is a hack, ony because we want to test clearing leaks
        // and since the action is run once to prewarm the cache
        assert.equal(initial.nodes - 1, after.nodes, 'node count does not grow');
      }
    }, self.driver);
  });
});
