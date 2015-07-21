casper.on('remote.message', function (message) {
  // uncommet to print all messages from console.log
  //this.echo(message);
});

casper.test.begin("Catalinker grensesnitt (verk)", 4, function (test) {
  casper.start('http://127.0.0.1:7777/work', function () {
    test.assertHttpStatus(200);
    test.assertTitle("Katalogisering", "har riktig tittel");
    test.assertSelectorHasText('h2[data-automation-id="page-heading"]', "Katalogisering av verk");
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


casper.test.begin("Catalinker grensesnitt (utgivelse)", 4, function (test) {
  casper.start('http://127.0.0.1:7777/publication', function () {
    test.assertHttpStatus(200);
    test.assertTitle("Katalogisering", "har riktig tittel");
    test.assertSelectorHasText('h2[data-automation-id="page-heading"]', "Katalogisering av utgivelse");
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

  casper.run(function () {
    test.done();
  });

});
