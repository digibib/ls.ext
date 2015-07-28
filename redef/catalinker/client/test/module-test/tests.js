casper.on('remote.message', function (message) {
  // uncommet to print all messages from console.log
  //this.echo(message);
});

function addValue(casper, property, value) {
  casper.sendKeys('input[data-automation-id="http://127.0.0.1:7777/ontology#' + property + '_0"]', value);
}

casper.test.begin("Catalinker grensesnitt (verk)", 6, function (test) {
  casper.start('http://127.0.0.1:7777/work', function () {
    test.assertHttpStatus(200);
    test.assertTitle("Katalogisering", "har riktig tittel");
    casper.waitForSelectorTextChange('h2[data-automation-id="page-heading"]', function () {
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

  casper.then(function () {
    test.assertNotExists('a[href="http://koha.deichman.no/cgi-bin/koha/opac-detail.pl?biblionumber=5"]');
    addValue(this, "biblio", "5");
    test.assertExists('a[href="http://koha.deichman.no/cgi-bin/koha/opac-detail.pl?biblionumber=5"]');
  });

  casper.run(function () {
    test.done();
  });

});


casper.test.begin("Catalinker grensesnitt (utgivelse)", 4, function (test) {
  casper.start('http://127.0.0.1:7777/publication', function () {
    test.assertHttpStatus(200);
    test.assertTitle("Katalogisering", "har riktig tittel");
    casper.waitForSelectorTextChange('h2[data-automation-id="page-heading"]', function () {
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

  casper.run(function () {
    test.done();
  });

});
