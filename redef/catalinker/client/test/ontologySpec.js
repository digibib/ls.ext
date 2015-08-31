var example_ontology = {
  "@graph": [{
    "@id": "deichman:Person",
    "@type": "rdfs:Class"
  }, {
    "@id": "deichman:Work",
    "@type": "rdfs:Class",
    "rdfs:label": [{
      "@language": "no",
      "@value": "Verk"
    }, {
      "@language": "en",
      "@value": "Work"
    }]
  }, {
    "@id": "deichman:Book",
    "@type": "rdfs:Class",
    "rdfs:label": [{
      "@language": "no",
      "@value": "Bok"
    }, {
      "@language": "en",
      "@value": "Book"
    }]
  }, {
    "@id": "deichman:biblio",
    "@type": "rdfs:Property",
    "rdfs:domain": {
      "@id": "deichman:Work"
    },
    "rdfs:range": {
      "@id": "http://www.w3.org/2001/XMLSchema#nonNegativeInteger"
    }
  }, {
    "@id": "deichman:creator",
    "@type": "rdfs:Property",
    "rdfs:domain": {
      "@id": "rdfs:Class"
    },
    "rdfs:range": {
      "@id": "deichman:Person"
    }
  }, {
    "@id": "deichman:identifier",
    "@type": "rdfs:Property",
    "rdfs:range": {
      "@id": "http://www.w3.org/2001/XMLSchema#string"
    }
  }, {
    "@id": "deichman:name",
    "@type": "rdfs:Property",
    "rdfs:domain": [{
      "@id" : "deichman:Publication"
    }, {
      "@id" : "deichman:Work"
    }],
    "rdfs:range": {
      "@id": "http://www.w3.org/2001/XMLSchema#string"
    }
  }, {
    "@id": "lvont:Language",
    "@type": "rdfs:Class"
  }, {
    "@id": "deichman:language",
    "@type": "rdfs:Property",
    "rdfs:domain": [{
      "@id" : "deichman:Publication"
    }, {
      "@id" : "deichman:Work"
    }],
    "rdfs:range": {
      "@id": "lvont:Language"
    }
  }, {
    "@id": "deichman:year",
    "@type": "rdfs:Property",
    "rdfs:domain": {
      "@id": "deichman:Work"
    },
    "rdfs:range": {
      "@id": "http://www.w3.org/2001/XMLSchema#gYear"
    }
  }],
  "@context": {
    "deichman": "http://192.168.50.12:8005/ontology#",
    "rdfs": "http://www.w3.org/2000/01/rdf-schema#",
    "lvont": "http://lexvo.org/ontology#"
  }
};

define(['ontology'], function (ontology) {

  describe("Parsing an ontology", function () {
    it("can filter properties that are valid for a class", function () {
      workProps = ontology.propsByClass(example_ontology, "Work");
      assert.equal(workProps.length, 6);
    });

    it("can resolve URIs against the supplied prefixes", function () {
      assert.equal(ontology.resolveURI(example_ontology, "deichman:Work"), "http://192.168.50.12:8005/ontology#Work");
    });
  });

  describe("Updating a resource", function () {
    it("can build patch requests adding properties", function () {
      var val = {
        old: { value: "", lang: "" },
        current: { value: "a", lang: "no" }
      };
      assert.equal(ontology.createPatch("http://x.org/s/1", "http://x.org/p1", val, "http://www.w3.org/2000/01/rdf-schema#langString"),
        '{"op":"add","s":"http://x.org/s/1","p":"http://x.org/p1","o":{"value":"a","lang":"no","type":"http://www.w3.org/2000/01/rdf-schema#langString"}}');
    });

    it("can build patch requests updating removing and adding properties", function () {
      var val = {
        old: { value: "b", lang: "" },
        current: { value: "a", lang: "no" }
      };
      assert.equal(ontology.createPatch("http://x.org/s/1", "http://x.org/p1", val, "http://www.w3.org/2000/01/rdf-schema#langString"),
        '[{"op":"del","s":"http://x.org/s/1","p":"http://x.org/p1","o":{"value":"b","type":"http://www.w3.org/2000/01/rdf-schema#langString"}},' +
        '{"op":"add","s":"http://x.org/s/1","p":"http://x.org/p1","o":{"value":"a","lang":"no","type":"http://www.w3.org/2000/01/rdf-schema#langString"}}]');
    });

    it("ignores empty values", function () {
      var val = {
        old: { value: "b", lang: "en" },
        current: { value: "", lang: "" }
      };
      assert.equal(ontology.createPatch("http://x.org/s/1", "http://x.org/p1", val, "http://www.w3.org/2000/01/rdf-schema#langString"),
        '{"op":"del","s":"http://x.org/s/1","p":"http://x.org/p1","o":{"value":"b","lang":"en","type":"http://www.w3.org/2000/01/rdf-schema#langString"}}');
    });

    it("builds patch with datatype", function () {
      var val = {
        old: { value: "", lang: "" },
        current: { value: "a", lang: "" }
      };
      assert.equal(ontology.createPatch("http://x.org/s/1", "http://x.org/p1", val, "http://a/mytype"),
        '{"op":"add","s":"http://x.org/s/1","p":"http://x.org/p1","o":{"value":"a","type":"http://a/mytype"}}');
    });
  });

  describe("Validating RDF Literals", function () {
    it("validates xsd:string literals", function () {
      assert(ontology.validateLiteral("æøå 世界", "http://www.w3.org/2001/XMLSchema#string"));
    });

    it("validates rdf:langString literals", function () {
      assert(ontology.validateLiteral("æøå 世界", "http://www.w3.org/1999/02/22-rdf-syntax-ns#langString"));
    });

    it("validates a valid xsd:gYear", function () {
      assert(ontology.validateLiteral("1981", "http://www.w3.org/2001/XMLSchema#gYear"));
      assert(ontology.validateLiteral("50", "http://www.w3.org/2001/XMLSchema#gYear"));
      assert(ontology.validateLiteral("-50", "http://www.w3.org/2001/XMLSchema#gYear"));
    });

    it("does not validate an invalid xsd:gYear", function () {
      assert.notOk(ontology.validateLiteral("19999", "http://www.w3.org/2001/XMLSchema#gYear"));
      assert.notOk(ontology.validateLiteral("+100", "http://www.w3.org/2001/XMLSchema#gYear"));
      assert.notOk(ontology.validateLiteral("--100", "http://www.w3.org/2001/XMLSchema#gYear"));
      assert.notOk(ontology.validateLiteral("200 b.c", "http://www.w3.org/2001/XMLSchema#gYear"));
      assert.notOk(ontology.validateLiteral("500 f.kr", "http://www.w3.org/2001/XMLSchema#gYear"));
    });

    it("validates a valid xsd:nonNegativeInteger", function () {
      assert(ontology.validateLiteral("0", "http://www.w3.org/2001/XMLSchema#nonNegativeInteger"));
      assert(ontology.validateLiteral("99", "http://www.w3.org/2001/XMLSchema#nonNegativeInteger"));
      assert(ontology.validateLiteral("+100", "http://www.w3.org/2001/XMLSchema#nonNegativeInteger"));
      assert(ontology.validateLiteral("54343", "http://www.w3.org/2001/XMLSchema#nonNegativeInteger"));
    });

    it("does not validate an invalid xsd:nonNegativeInteger", function () {
      assert.notOk(ontology.validateLiteral("-1", "http://www.w3.org/2001/XMLSchema#nonNegativeInteger"));
      assert.notOk(ontology.validateLiteral("3.14", "http://www.w3.org/2001/XMLSchema#nonNegativeInteger"));
      assert.notOk(ontology.validateLiteral("20e10", "http://www.w3.org/2001/XMLSchema#nonNegativeInteger"));
      assert.notOk(ontology.validateLiteral("abc", "http://www.w3.org/2001/XMLSchema#nonNegativeInteger"));
    });

    it("throws an error if it doesn't handle the given datatype", function () {
      assert.throws(function () {
        ontology.validateLiteral("abc", "http://example.org1/MyCustomDataType");
      },
           "don't know how to validate literal of range: <http://example.org1/MyCustomDataType>"
         );
    });

  });

  describe("Parsing JSON-LD", function () {
    it("converts the properties into a managble form", function () {
      assert.equal(
        JSON.stringify(ontology.extractValues({
          "@id": "http://192.168.50.12:8005/work/w392735109936",
          "@type": "deichman:Work",
          "deichman:creator": {"@id": "http://example.org/petter"},
          "deichman:name": [{ "@language": "en", "@value": "the title" }, { "@language": "no", "@value": "tittelen" }],
          "deichman:year": "1981",
          "@context": {
            "deichman": "http://192.168.50.12:8005/ontology#",
            "rdfs": "http://www.w3.org/2000/01/rdf-schema#" } })),
        JSON.stringify({
          "http://192.168.50.12:8005/ontology#creator":
            [{ old: { value: "http://example.org/petter" },
              current: { value: "http://example.org/petter" } }],
          "http://192.168.50.12:8005/ontology#name":
            [{ old: { value: "the title", lang: "en" },
              current: { value: "the title", lang: "en" } },
             { old: { value: "tittelen", lang: "no" },
                     current: { value: "tittelen", lang: "no" } }],
          "http://192.168.50.12:8005/ontology#year":
            [{ old: { value: "1981", lang: "" },
              current: { value: "1981", lang: "" } }]
        }));
    });

    it("extracts the resource label in desired language", function () {
      assert.equal(ontology.resourceLabel(example_ontology, "Work", "en"), "Work");
      assert.equal(ontology.resourceLabel(example_ontology, "Work", "no"), "Verk");
    });
  });

});
