casper.test.begin("Catalinker grensesnitt", 2, function(test) {
  casper.start('http://127.0.0.1:7777/app/index.html', function() {
    test.assertHttpStatus(200);
    test.assertTitle("Katalogisering", "har riktig tittel");
  });

  casper.run(function() {
        test.done();
  });

});
