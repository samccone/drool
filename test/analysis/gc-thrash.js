var drool = require('../../');
var tests = [
  {
    url: 'http://todomvc.com/examples/emberjs/index.html',
    todo: '#new-todo',
    li: '#todo-list li',
    destroy: '.destroy'
  },
  {
    url: 'http://todomvc.com/examples/angularjs/index.html',
    todo: '#new-todo',
    li: '#todo-list li',
    destroy: '.destroy'
  },
  {
    url: 'http://todomvc.com/examples/vue/index.html',
    todo: '.new-todo',
    li: '.todo-list li',
    destroy: '.destroy'
  },
  {
    url: 'http://todomvc.com/examples/backbone/index.html',
    todo: '.new-todo',
    li: '.todo-list li',
    destroy: '.destroy'
  },
  {
    url: 'http://todomvc.com/examples/backbone_marionette/index.html',
    todo: '#new-todo',
    li: '#todo-list li',
    destroy: '.destroy'
  },
  {
    url: 'http://todomvc.com/examples/jquery/index.html',
    todo: '#new-todo',
    li: '#todo-list li',
    destroy: '.destroy'
  },
  {
    url: 'http://todomvc.com/examples/ampersand/index.html',
    todo: '#new-todo',
    li: '#todo-list li',
    destroy: '.destroy'
  },
  {
    url: 'http://todomvc.com/examples/polymer/index.html',
    todo: '#new-todo',
    li: '#todo-list li',
    destroy: '.destroy'
  },
  {
    url: 'http://todomvc.com/examples/vanillajs/index.html',
    todo: '.new-todo',
    li: '.todo-list li',
    destroy: '.destroy'
  },
  {
    url: 'http://todomvc.com/examples/react/index.html',
    todo: '.new-todo',
    li: '.todo-list li',
    destroy: '.destroy'
  },
];

tests.forEach(function(test) {
  var config = {
    chromeOptions: 'no-sandbox'
  };

  if (typeof process.env.chromeBinaryPath !== 'undefined') {
    config.chromeBinaryPath = process.env.chromeBinaryPath;
  }

  var driver = drool.start(config);

  drool.flow({
    repeatCount: 10,
    setup: function() {
      driver.get(test.url);
    },
    action: function() {
      driver.wait(function() {
        return driver.isElementPresent(drool.webdriver.By.css(test.todo));
      }, 10000);

      driver.findElement(drool.webdriver.By.css(test.todo)).sendKeys('find magical goats', drool.webdriver.Key.ENTER);

      driver.wait(function() {
        return driver.isElementPresent(drool.webdriver.By.css(test.li));
      }, 1000);

      driver.findElement(drool.webdriver.By.css(test.li)).click();

      driver.wait(function() {
        return driver.isElementPresent(drool.webdriver.By.css(test.destroy));
      }, 1000);

      driver.findElement(drool.webdriver.By.css(test.destroy)).click();
    },
    assert: function(after, initial) {
      console.log(test.url, (after.gc.MinorGC.duration +
            after.gc.MajorGC.duration +
            after.gc['V8.GCScavenger'].duration +
            after.gc['V8.GCIncrementalMarking'].duration) + ' μs');
    }
  }, driver);

  driver.quit();
});
