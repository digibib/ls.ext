casper.on('remote.message', function (message) {
  // uncommet to print all messages from console.log
  //this.echo(message);
});

casper.test.begin("Catalinker grensesnitt (verk)", 3, function (test) {
  casper.start('http://127.0.0.1:7777/work', function () {
    casper.waitForResource("/ontology");

    test.assertHttpStatus(200);
    test.assertTitle("Katalogisering", "har riktig tittel");
    test.assertSelectorHasText('h2[data-automation-id="page-heading"]', "Katalogisering av verk");
  });

  casper.run(function () {
    test.done();
  });

});


casper.test.begin("Catalinker grensesnitt (utgivelse)", 3, function (test) {
  casper.start('http://127.0.0.1:7777/publication', function () {
    casper.waitForResource("/ontology");

    test.assertHttpStatus(200);
    test.assertTitle("Katalogisering", "har riktig tittel");
    test.assertSelectorHasText('h2[data-automation-id="page-heading"]', "Katalogisering av utgivelse");
  });

  casper.run(function () {
    test.done();
  });

});
