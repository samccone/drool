Leaky is an automation layer that is used to measure if a set of "clean" actions results in a DOM and or Listener leak.

##### Why am I making this?

After running perf/memory tests across multiple [todomvc](https://github.com/tastejs/todomvc) implementations, I found that almost all implementations have significant memory leaks on the most basic of tasks. Worse yet, most of these leaks were introduced at a framework level, or were introduced by "expert/(framework authors)". The question arose in my mind, if people who authored a framework are introducing leaks in the most trivial of applications, how can users be expected to create non-leaking implementations of much more complex applications.

##### Goals

Ideally leaky will leverage standard interfaces, such as todomvc, to test for leaks at a framework level. The result of which should help framework authors and developers realize that memory leaks are pervasive in the tools that we use.

Chrome devtools is a powerful utility layer for detecting memory issues, yet the fact still stands that most developers do not know how to use the tooling around it to arrive any thing that is directly actionable. Leaky aims to be a generic automated abstraction layer, so people can get good "numbers" in a consistent way without having to deep dive into memory profiling.

##### Running

Ensure that you have at least version `2.16.333243` of chromedriver.

leaky exposes two methods for you

```js
var leaky = require('samccone/leaky');

var driver = leaky.start({
  chromeOptions: 'no-sandbox',
  chromeBinaryPath: '<optional - useful for CI>'
});

driver.get('http://localhost:8000');

leaky.getCounts(driver)
.then(function(memory){});

// do your actions here

leaky.getCounts(driver)
.then(function(memory){});

driver.quit();
```

[![Build Status](https://travis-ci.org/samccone/leaky.svg?branch=master)](https://travis-ci.org/samccone/leaky)
