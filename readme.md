Drool is an automation layer that is used to measure if a set of "clean" actions results in a DOM and or Listener leak.

<p align="center">
  <a href="docs/api.md"> View the API Docs </a> </br> </br>
  <a href="https://travis-ci.org/samccone/drool"> <img src="https://travis-ci.org/samccone/drool.svg?branch=master" alt="Build Status"/></a>
  <a href="https://gitter.im/samccone/drool?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge"> <img src="https://badges.gitter.im/Join%20Chat.svg" alt="Join the chat at https://gitter.im/samccone/drool"/></a>
</p>

--------------

#### Real World wins

Drool has made it far easier to identify memory leaks in an automated and reproducible way, for example:

* TodoMVC
  * [JSBlocks](https://github.com/tastejs/todomvc/pull/1297#issuecomment-112828342)
  * [Atma.js](https://github.com/tastejs/todomvc/pull/1337#issuecomment-112821596)
  * [Automated leak based CI failures](https://github.com/tastejs/todomvc/pull/1464)
* Chromium
  * [Core input element node leak](https://code.google.com/p/chromium/issues/detail?id=516153)
* Material Design Lite
  * [Menu Component Leaking Listeners](https://github.com/google/material-design-lite/issues/761)
* Beaker Notebook
  * [CI memory smoketest on every PR](https://github.com/twosigma/beaker-notebook/blob/9298ccf33e646638f8a588405fa8fa5919742636/test/memory-tests.js)


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
    driver.findElement(drool.webdriver.By.css('.new-todo')).sendKeys('find magical goats', drool.webdriver.Key.ENTER);
    driver.findElement(drool.webdriver.By.css('.todo-list li')).click();
    driver.findElement(drool.webdriver.By.css('.destroy')).click();
  },
  assert: function(after, initial) {
    assert.equal(initial.counts.nodes, after.counts.nodes, 'node count should match');
  }
}, driver)

driver.quit();
```

[View the API Docs](docs/api.md)
