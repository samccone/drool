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
        assert.equal(initial.counts.nodes, after.counts.nodes, 'node count should match');
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
        assert.notEqual(initial.counts.nodes, after.counts.nodes, 'node count should not match');
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
        assert.equal(initial.counts.nodes - 1, after.counts.nodes, 'node count does not grow');
      }
    }, self.driver);
  });

  it('exposes gc info', function() {
    var self = this;

    return drool.flow({
      setup: function() {
        self.driver.get('file://' + path.join(__dirname, 'examples/', 'inputs.html'));
      },
      action: function() {
      },
      assert: function(after, initial) {
        var gcKeys = 'MinorGC,MajorGC,V8.GCScavenger,V8.GCIncrementalMarking';

        assert.equal(Object.keys(initial.gc).join(','), gcKeys);
        assert.equal(Object.keys(after.gc).join(','), gcKeys);
      }
    }, self.driver);
  });
});

describe('drool.flow', function() {
  it('throws helpfully when no driver is given', function(done) {
    try {
      drool.flow({
        setup: function() {},
        action: function() {},
        beforeAssert: function() {},
        assert: function() {}
      });
    } catch (e) {
      assert.equal(
        e.message,
        'Please provide a driver (as returned by drool.start) as the second argument to drool.flow',
        'helpful error is not thrown'
      );
      done();
    }
  });
});
