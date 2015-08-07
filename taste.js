var drool = require('./');
var driver = drool.start({
  chromeOptions: 'no-sandbox'
});

function idApp() {
  return driver.findElement(drool.webdriver.By.css('#todoapp')).isDisplayed()
  .then(function() {
    return true;
  })
  .thenCatch(function() {
    return false;
  })
}

function newTodoSelector(name) {
  return idApp().then(function(isId) {
    if (isId) {
      return '#new-todo'
    }

    return '.new-todo';
  });
}

function listSelector(name) {
  return idApp().then(function(isId) {
    if (isId) {
      return '#todo-list li'
    }

    return '.todo-list li';
  });
}

["examples/angularjs_require",  "examples/flight", "examples/react", "examples/canjs", "examples/backbone", "examples/angularjs", "examples/emberjs", "examples/knockoutjs", "examples/dojo", "examples/mithril", "examples/ampersand", "examples/vue", "examples/backbone_marionette", "examples/troopjs_require", "examples/spine", "examples/vanilladart/build/web", "examples/closure", "examples/elm", "examples/angular-dart/web", "examples/typescript-backbone", "examples/typescript-angular", "examples/serenadejs", "examples/reagent", "examples/thorax", "examples/chaplin-brunch/public", "examples/backbone_require", "examples/knockoutjs_require","examples/canjs_require", "examples/thorax_lumbar/public", "examples/somajs_require", "examples/durandal", "examples/lavaca_require", "examples/cujo/index.html", "examples/sammyjs", "examples/epitome", "examples/somajs", "examples/duel/www", "examples/kendo", "examples/puremvc", "examples/olives", "examples/dijon", "examples/rappidjs", "examples/extjs_deftjs", "examples/enyo_backbone", "examples/angularjs-perf", "examples/sapui5", "examples/exoskeleton", "examples/atmajs", "examples/ractive", "examples/react-backbone", "examples/aurelia", "examples/foam", "examples/webrx", "examples/angular2"].reverse().forEach(function(name) {
  drool.flow({
    repeatCount: 5,
    setup: function() {
      driver.get('http://todomvc.com/' + name);
    },
    action: function(name) {
      driver.wait(function() {
        return driver.findElement(drool.webdriver.By.css(newTodoSelector(name)))
        .sendKeys('find magical goats', drool.webdriver.Key.ENTER)
        .thenCatch(function() {
          return false;
        })
        .then(function() {
          return driver.findElement(drool.webdriver.By.css(listSelector(name))).isDisplayed()
          .then(function() {
            return true;
          })
          .thenCatch(function() {
            return false;
          });
        });
      }, 5000);

      driver.wait(function() {
        return driver.findElement(drool.webdriver.By.css(listSelector(name))).click()
        .thenCatch(function() {
          return false;
        })
        .then(function() {
          return true;
        });
      });

      driver.findElement(drool.webdriver.By.css('.destroy')).click();
    }.bind(null, name),
    assert: function(after, initial) {
      console.log(this + ', ' + (after.nodes - initial.nodes) + ', ' + (after.jsHeapSizeUsed - initial.jsHeapSizeUsed) + ', ' + (after.jsEventListeners - initial.jsEventListeners));
    }.bind(name)
  }, driver)
});

driver.quit();

