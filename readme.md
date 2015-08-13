Drool is an automation layer that is used to measure if a set of "clean" actions results in a DOM and or Listener leak.

<p align="center">
  <a href="docs/api.md"> View the API Docs </a> </br> </br>
  <a href="https://travis-ci.org/samccone/drool"> <img src="https://travis-ci.org/samccone/drool.svg?branch=master" alt="Build Status"/></a>
</p>

--------------

[![Join the chat at https://gitter.im/samccone/drool](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/samccone/drool?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

##### Why am I making this?

After running perf/memory tests across multiple [todomvc](https://github.com/tastejs/todomvc) implementations, I found that almost all implementations have significant memory leaks on the most basic of tasks. Worse yet, most of these leaks were introduced at a framework level, or were introduced by "expert/(framework authors)". The question arose in my mind, if people who authored a framework are introducing leaks in the most trivial of applications, how can users be expected to create non-leaking implementations of much more complex applications.

##### Goals

Ideally Drool will leverage standard interfaces, such as todomvc, to test for leaks at a framework level. The result of which should help framework authors and developers realize that memory leaks are pervasive in the tools that we use.

Chrome devtools is a powerful utility layer for detecting memory issues, yet the fact still stands that most developers do not know how to use the tooling around it to arrive any thing that is directly actionable. Drool aims to be a generic automated abstraction layer, so people can get good "numbers" in a consistent way without having to deep dive into memory profiling.

##### Running

Ensure that you have at least version `2.16.333243` of chromedriver.

```js
var drool = require('drool');
var assert = require('assert');

var driver = drool.start({
  chromeOptions: 'no-sandbox'
});

drool.flow({
  repeatCount: 100,
  setup: function() {
    driver.get('http://todomvc.com/examples/backbone/');
  },
  action: function() {
    driver.findElement(drool.webdriver.By.css('#new-todo')).sendKeys('find magical goats', drool.webdriver.Key.ENTER);
    driver.findElement(drool.webdriver.By.css('#todo-list li')).click();
    driver.findElement(drool.webdriver.By.css('.destroy')).click();
  },
  assert: function(after, initial) {
    assert.equal(initial.nodes, after.nodes, 'node count should match');
  }
}, driver)

driver.quit();
```

[View the API Docs](docs/api.md)
