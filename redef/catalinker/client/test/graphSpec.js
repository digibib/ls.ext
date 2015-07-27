var jsonld = JSON.stringify({
  "@graph" : [{
    "@id" : "http://192.168.50.12:8005/publication/p976722435911",
    "@type" : "deichman:Publication",
    "deichman:format" : "bok",
    "deichman:language" : "tysk",
    "deichman:publicationOf" : "http://192.168.50.12:8005/work/w733425565188",
    "deichman:name" : [{
      "@language" : "en",
      "@value" : "elevatormusic"
    }, "heizemuzik"]
  }, {
    "@id" : "http://192.168.50.12:8005/work/w733425565188",
    "@type" : "deichman:Work",
    "deichman:creator" : "petter",
    "deichman:name" : "heismusikk",
    "deichman:year" : "1981"
  }],
  "@context" : {
    "deichman" : "http://192.168.50.12:8005/ontology#",
    "rdfs" : "http://www.w3.org/2000/01/rdf-schema#"
  }
});

var jsonld_single = JSON.stringify({
  "@id" : "http://192.168.50.12:8005/work/w322624890697",
  "@type" : "deichman:Work",
  "deichman:creator" : "blah",
  "@context" : {
      "deichman" : "http://192.168.50.12:8005/ontology#",
      "rdfs" : "http://www.w3.org/2000/01/rdf-schema#"
    }
});

define(['graph'], function (graph) {

  describe("Parsing JSON-LD as a graph", function () {
    it("can extract works from graph", function () {
      var g = graph.parse(jsonld);
      assert.equal(g.works.length, 1);
      var work = g.works[0];
      assert.equal(work.uri, "http://192.168.50.12:8005/work/w733425565188");
      assert.equal(work.properties.length, 3);
      assert.equal(work.properties[0].predicate, "http://192.168.50.12:8005/ontology#creator");
      assert.equal(work.properties[0].value, "petter");
      assert.equal(work.properties[1].predicate, "http://192.168.50.12:8005/ontology#name");
      assert.equal(work.properties[1].value, "heismusikk");
      assert.equal(work.properties[2].predicate, "http://192.168.50.12:8005/ontology#year");
      assert.equal(work.properties[2].value, "1981");
    });

    it("can extract work from graph where graph has just one resource", function () {
      var g = graph.parse(jsonld_single);
      assert.equal(g.works.length, 1);
      assert.equal(g.works[0].uri, "http://192.168.50.12:8005/work/w322624890697");
      assert.equal(g.works[0].properties.length, 1);
      assert.equal(g.works[0].properties[0].predicate, "http://192.168.50.12:8005/ontology#creator");
      assert.equal(g.works[0].properties[0].value, "blah");
    });

    it("can attach publications belonging to a work", function () {
      var g = graph.parse(jsonld);

      assert.equal(g.works.length, 1);
      assert.equal(g.works[0].publications.length, 1);

      var pub = g.works[0].publications[0];
      assert.equal(pub.uri, "http://192.168.50.12:8005/publication/p976722435911");
      assert.equal(pub.properties.length, 5);
    });

    it("can filter property of a publication", function () {
      var g = graph.parse(jsonld);
      var pub = g.works[0].publications[0];

      var name_props = pub.property("http://192.168.50.12:8005/ontology#name");
      assert.equal(name_props.length, 2);
      assert.equal(name_props[0].value, "elevatormusic");
      assert.equal(name_props[0].language, "en");
      assert.equal(name_props[0].datatype, "http://www.w3.org/1999/02/22-rdf-syntax-ns#langString");
      assert.equal(name_props[1].value, "heizemuzik");
      assert.equal(name_props[1].datatype, "http://www.w3.org/2001/XMLSchema#string");
    });

    it("can filter property of a work", function () {
      var g = graph.parse(jsonld);
      var work = g.works[0];
      var name_props = work.property(g.resolve("deichman:name"));
      assert.equal(name_props.length, 1);
      assert.equal(name_props[0].value, "heismusikk");
    });
  });

});
