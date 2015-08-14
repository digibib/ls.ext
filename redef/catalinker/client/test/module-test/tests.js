casper.on('remote.message', function (message) {
  // uncommet to print all messages from console.log
  //this.echo(message);
});

function addValue(casper, property, value) {
  casper.sendKeys('input[data-automation-id="http://127.0.0.1:7777/ontology#' + property + '_0"]', value);
}

casper.test.begin("Catalinker grensesnitt (verk)", 4, function (test) {
  casper.start('http://127.0.0.1:7777/work');

  casper.waitFor(function check() {
    return this.getCurrentUrl() !== 'http://127.0.0.1:7777/work'; // make sure we have been redirected
  }, function then() {
    test.assertHttpStatus(200);
    test.assertTitle("Katalogisering", "har riktig tittel");
    casper.waitForText("Katalogisering av verk", function () {
      test.assertSelectorHasText('h2[data-automation-id="page-heading"]', "Katalogisering av verk");
    });
  });

  casper.waitFor(function check() {
    return this.evaluate(function () {
      return document.querySelectorAll('[data-automation-id="resource_uri"]')[0].value !== "";
    });
  }, function then() {
    var resource_uri = this.evaluate(function () {
      return document.querySelectorAll('[data-automation-id="resource_uri"]')[0].value;
    });
    test.assertEqual(resource_uri, "http://127.0.0.1:7777/work/1");
  });

  casper.run(function () {
    test.done();
  });

});

casper.test.begin("Catalinker grensesnitt (utgivelse)", 8, function (test) {
  casper.start('http://127.0.0.1:7777/publication?resource=http://127.0.0.1:7777/publication/1');

  casper.then(function () {
    test.assertHttpStatus(200);
    test.assertTitle("Katalogisering", "har riktig tittel");
    casper.waitForText("Katalogisering av utgivelse", function () {
      test.assertSelectorHasText('h2[data-automation-id="page-heading"]', "Katalogisering av utgivelse");
    });
  });

  casper.waitFor(function check() {
    return this.evaluate(function () {
      return document.querySelectorAll('[data-automation-id="resource_uri"]')[0].value !== "";
    });
  }, function then() {
    var resource_uri = this.evaluate(function () {
      return document.querySelectorAll('[data-automation-id="resource_uri"]')[0].value;
    });
    test.assertEqual(resource_uri, "http://127.0.0.1:7777/publication/1");
  });

  casper.waitFor(function check() {
    return this.evaluate(function () {
      return document.querySelectorAll('[data-automation-id="http://127.0.0.1:7777/ontology#recordID_0"]')[0].value !== "";
    });
  }, function then() {
    var record_id = this.evaluate(function () {
      return document.querySelectorAll('[data-automation-id="http://127.0.0.1:7777/ontology#recordID_0"]')[0].value;
    });
    test.assertEqual(record_id, "123");

    var disabled = this.evaluate(function () {
      return document.querySelectorAll('[data-automation-id="http://127.0.0.1:7777/ontology#recordID_0"]')[0].disabled;
    });
    test.assertEqual(disabled, true);
  });

  casper.then(function () {
    test.assertNotExists('a[href="www.dummy.com"]');
    addValue(this, "publicationOf", "www.dummy.com");
    test.assertExists('a[href="www.dummy.com"]');
  });

  casper.run(function () {
    test.done();
  });

});
