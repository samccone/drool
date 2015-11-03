## Drool API Guide

Drool's goal is to make it simple to add memory regression and profiling tests to your application with minimal boilerplate.

#### Table of Contents

* [Quick Start](#quick-start)
* [API](#api)
  * [start](#start)
  * [flow](#flow)
    * [flow cycle](#flow-cycle)
  * [getCounts](#getcounts)
  * [webdriver](#webdriver)

### Quick Start

To get started with drool:

    npm i drool selenium-webdriver --save-dev

The next step is to require and [start](#start) drool.

```js
var drool = require('drool');

var driver = drool.start({
  chromeOptions: 'no-sandbox',
  chromeBinaryPath: '<optional - useful for CI>'
});
```

The next step is to define a flow. A [flow](#flow) is a declarative hash where you define actions at given points in the lifecycle of your drool tests.

```js
return drool.flow({
  setup: function() {
    driver.get('file://' + path.join(__dirname, 'examples/', 'leaking.html'));
  },
  action: function() {
    driver.findElement(webdriver.By.css('#leak')).click();
  },
  assert: function(after, initial) {
    assert.notEqual(initial.counts.nodes, after.counts.nodes, 'node count should not match');
  }
}, driver);
```

Once you are done interacting with the driver, you then will want to quit the driver (to close the browser).

```js
driver.quit();
```

### API

#### start

`start` returns a [selenium webdriver](http://selenium.googlecode.com/git/docs/api/javascript/module_selenium-webdriver.html) instance. It takes an optional argument object that can have two keys, `chromeBinaryPath` and `chromeOptions`.

* `chromeBinaryPath` must be a string.
* `chromeOptions` can be an array or an array or strings.

```js
drool.start({
  chromeBinaryPath: 'my/path/to-chrome',
  chromeOptions: ['--foo=1', '--bar=2']
});
```

#### flow

The `flow` method returns a Promise, that will be resolved (or rejected) after the exit step has been called (regardless of if you pass an exit method). Flow takes two required aguments, the first agument is an object that contains the flow actions, the second argument is a [selenium webdriver](http://selenium.googlecode.com/git/docs/api/javascript/module_selenium-webdriver.html) instance (For instance the one returned by [start](#start)

##### flow cycle

the "flow" action object is a set of life cycle key value pairs that will be invoked in the following order.

1. `setup`
2. `action` (to prewarm any DOM/Listener cache)
3. Initial Measurement is taken aftter via [getCounts](#getcounts)
4. `action` * `repeatCount` times (repeat count defaults to 5)
5. `beforeAssert`
6. Final Measurement is taken after via [getCounts](#getcounts)
7. `assert`
8. `exit`

Each step in the flow, **except for assert**, is optional. Keep in mind however that your flow should cleanly `exit`, and `action` should be able to be invoked an unlimited number of times.

As the invokee of a flow, you can control how many times the action is invoked via `repeatCount`. Increasing this number will allow you to more easily identify a leaking interaction at the cost of time to run.

For example:

```js
return drool.flow({
  repeatCount: 100,
  setup: function() {
    driver.get('file://' + path.join(__dirname, 'examples/', 'inputs.html'));
  },
  action: function() {
    driver.findElement(drool.webdriver.By.css('button')).click();
  },
  beforeAssert: function() {
    driver.findElement(drool.webdriver.By.css('#clean')).click();
  },
  assert: function(after, initial) {
    assert.equal(initial.counts.nodes, after.counts.nodes, 'node count should match');
  },
  exit: function() {
    driver.get('https://google.com/');
  }
}, driver);
```

#### getCounts

The `getCounts` method abstracts the work of forcing a garbage collection and collecting the last performance counter stats from the driver instance.

`getCounts` returns a promise that resolves with the following data structure:

```json
{"counts": {
		"documents": 1,
		"jsEventListeners": 0,
		"jsHeapSizeUsed": 1747160,
		"nodes": 5
	}, "gc": {
		"MajorGC": {
			"duration": 1,
			"count": 1
		},
		"MinorGC": {
			"duration": 1,
			"count": 1
		},
		"V8.GCScavenger": {
			"duration": 1,
			"count": 1
		},
		"V8.GCIncrementalMarking": {
			"duration": 1,
			"count": 1
		}
	}
}
```

For example:

```js
drool.getCounts(driver).then(function(data) {
  console.log('the node count is ' + data.counts.nodes);
});
```

### webdriver

The webdriver object exposed on drool, is a reference to the selenium-webdriver module required and used by drool.
