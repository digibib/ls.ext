var ontology = {
  "@graph" : [ {
    "@id" : "deichman:Person",
    "@type" : "rdfs:Class",
    "rdfs:comment" : [ {
      "@language" : "no",
      "@value" : "En person er et vesen som har attributtene generelt assosiert med personer"
    }, {
      "@language" : "en",
      "@value" : "A person is a being that has the attributes generally associated with personhood"
    } ],
    "rdfs:label" : [ {
      "@language" : "no",
      "@value" : "Person"
    }, {
      "@language" : "en",
      "@value" : "Person"
    } ]
  }, {
    "@id" : "deichman:Work",
    "@type" : "rdfs:Class",
    "rdfs:comment" : [ {
      "@language" : "no",
      "@value" : "Et verk er resultatet av kreativt arbeid"
    }, {
      "@language" : "en",
      "@value" : "A work is the result of a creative effort"
    } ],
    "rdfs:label" : [ {
      "@language" : "no",
      "@value" : "Verk"
    }, {
      "@language" : "en",
      "@value" : "Work"
    } ]
  }, {
    "@id" : "deichman:biblio",
    "@type" : "rdfs:Property",
    "rdfs:comment" : [ {
      "@language" : "no",
      "@value" : "Relasjonen mellom et verk og en ls.ext-intern identifikator for en Koha-post"
    }, {
      "@language" : "en",
      "@value" : "The relationship between a work and a ls.ext-internal Koha-record identifier"
    } ],
    "rdfs:domain" : {
      "@id" : "deichman:Work"
    },
    "rdfs:label" : [ {
      "@language" : "no",
      "@value" : "Biblio"
    }, {
      "@language" : "en",
      "@value" : "Biblio"
    } ],
    "rdfs:range" : {
      "@id" : "http://www.w3.org/2001/XMLSchema#nonNegativeInteger"
    }
  }, {
    "@id" : "deichman:creator",
    "@type" : "rdfs:Property",
    "rdfs:comment" : [ {
      "@language" : "no",
      "@value" : "Relasjonen mellom et kreativt arbeid og personen som har skapt det"
    }, {
      "@language" : "en",
      "@value" : "The relationship between a creative work and the person who created it"
    } ],
    "rdfs:domain" : {
      "@id" : "deichman:Work"
    },
    "rdfs:label" : [ {
      "@language" : "no",
      "@value" : "Skaper"
    }, {
      "@language" : "en",
      "@value" : "Creator"
    } ],
    "rdfs:range" : {
      "@id" : "deichman:Person"
    }
  }, {
    "@id" : "deichman:identifier",
    "@type" : "rdfs:Property",
    "rdfs:comment" : [ {
      "@language" : "no",
      "@value" : "Relasjonen mellom en ting og en attribut som unikt identifiserer den i en gitt kontekst"
    }, {
      "@language" : "en",
      "@value" : "The relationship between a thing and an attribute which uniquely identifies it in a given context"
    } ],
    "rdfs:label" : [ {
      "@language" : "no",
      "@value" : "Identifikator"
    }, {
      "@language" : "en",
      "@value" : "Identifier"
    } ],
    "rdfs:range" : {
      "@id" : "http://www.w3.org/2001/XMLSchema#string"
    }
  }, {
    "@id" : "deichman:name",
    "@type" : "rdfs:Property",
    "rdfs:comment" : [ {
      "@language" : "en",
      "@value" : "Relasjonen mellom en ting og det den er kalt"
    }, {
      "@language" : "en",
      "@value" : "The relationship between a thing and what it is called"
    } ],
    "rdfs:domain" : {
      "@id" : "rdfs:Class"
    },
    "rdfs:label" : [ {
      "@language" : "no",
      "@value" : "Navn"
    }, {
      "@language" : "en",
      "@value" : "Name"
    } ],
    "rdfs:range" : {
      "@id" : "http://www.w3.org/2001/XMLSchema#string"
    }
  }, {
    "@id" : "deichman:year",
    "@type" : "rdfs:Property",
    "rdfs:comment" : [ {
      "@language" : "no",
      "@value" : "Relasjonen mellom et verk og året det ble skapt"
    }, {
      "@language" : "en",
      "@value" : "The relationship between a work and the year it was created"
    } ],
    "rdfs:domain" : {
      "@id" : "deichman:Work"
    },
    "rdfs:label" : [ {
      "@language" : "no",
      "@value" : "Årstall"
    }, {
      "@language" : "en",
      "@value" : "Year"
    } ],
    "rdfs:range" : {
      "@id" : "http://www.w3.org/2001/XMLSchema#gYear"
    }
  } ],
  "@context" : {
    "deichman" : "http://192.168.50.12:8005/ontology#",
    "rdfs" : "http://www.w3.org/2000/01/rdf-schema#"
  }
};

describe("Parsing an ontology", function() {
  it("can filter properties that are valid for a class", function() {
    workProps = rdf.propsByClass(ontology, "Work");
    assert.equal(workProps.length, 5);
  });

  it("can resolve URIs against the supplied prefixes", function() {
    assert.equal(rdf.resolveURI(ontology, "deichman:Work"), "http://192.168.50.12:8005/ontology#Work")
  })
});

describe("Updating a resource", function() {
  it("can build patch requests adding properties", function() {
    var val = {
      old: { value: "", type: "", lang: "" },
      current: { value: "a", type: "", lang: "no" }
    }
    assert.equal(rdf.createPatch("http://x.org/s/1", "http://x.org/p1", val),
      '{"op":"add","s":"http://x.org/s/1","p":"http://x.org/p1","o":{"value":"a","lang":"no"}}')
  });

  it("can build patch requests updating removing and adding properties", function() {
    var val = {
      old: { value: "b", type: "", lang: "" },
      current: { value: "a", type: "", lang: "no" }
    }
    assert.equal(rdf.createPatch("http://x.org/s/1", "http://x.org/p1", val),
      '[{"op":"del","s":"http://x.org/s/1","p":"http://x.org/p1","o":{"value":"b"}},{"op":"add","s":"http://x.org/s/1","p":"http://x.org/p1","o":{"value":"a","lang":"no"}}]')
  });

  it("ignores empty values", function() {
    var val = {
      old: { value: "b", type: "", lang: "en" },
      current: { value: "", type: "", lang: "" },
    }
    assert.equal(rdf.createPatch("http://x.org/s/1", "http://x.org/p1", val),
      '{"op":"del","s":"http://x.org/s/1","p":"http://x.org/p1","o":{"value":"b","lang":"en"}}')
  });
});

describe("Validating RDF Literals", function() {
  it("validates xsd:string literals", function() {
    assert(rdf.validateLiteral("æøå 世界", "http://www.w3.org/2001/XMLSchema#string"));
  });

  it("validates a valid xsd:gYear", function() {
    assert(rdf.validateLiteral("1981", "http://www.w3.org/2001/XMLSchema#gYear"));
    assert(rdf.validateLiteral("50", "http://www.w3.org/2001/XMLSchema#gYear"));
    assert(rdf.validateLiteral("-50", "http://www.w3.org/2001/XMLSchema#gYear"));
  });

  it("does not validate an invalid xsd:gYear", function() {
    assert.notOk(rdf.validateLiteral("19999", "http://www.w3.org/2001/XMLSchema#gYear"));
    assert.notOk(rdf.validateLiteral("+100", "http://www.w3.org/2001/XMLSchema#gYear"));
    assert.notOk(rdf.validateLiteral("--100", "http://www.w3.org/2001/XMLSchema#gYear"));
    assert.notOk(rdf.validateLiteral("200 b.c", "http://www.w3.org/2001/XMLSchema#gYear"));
    assert.notOk(rdf.validateLiteral("500 f.kr", "http://www.w3.org/2001/XMLSchema#gYear"));
  });

  it("validates a valid xsd:nonNegativeInteger", function() {
    assert(rdf.validateLiteral("0", "http://www.w3.org/2001/XMLSchema#nonNegativeInteger"));
    assert(rdf.validateLiteral("99", "http://www.w3.org/2001/XMLSchema#nonNegativeInteger"));
    assert(rdf.validateLiteral("+100", "http://www.w3.org/2001/XMLSchema#nonNegativeInteger"));
    assert(rdf.validateLiteral("54343", "http://www.w3.org/2001/XMLSchema#nonNegativeInteger"));
  });

  it("does not validate an invalid xsd:nonNegativeInteger", function() {
    assert.notOk(rdf.validateLiteral("-1", "http://www.w3.org/2001/XMLSchema#nonNegativeInteger"));
    assert.notOk(rdf.validateLiteral("3.14", "http://www.w3.org/2001/XMLSchema#nonNegativeInteger"));
    assert.notOk(rdf.validateLiteral("20e10", "http://www.w3.org/2001/XMLSchema#nonNegativeInteger"));
    assert.notOk(rdf.validateLiteral("abc", "http://www.w3.org/2001/XMLSchema#nonNegativeInteger"));
  });

  it("throws an error if it doesn't handle the given datatype", function() {
    assert.throws(function() { rdf.validateLiteral("abc", "http://example.org1/MyCustomDataType") },
      "don't know how to validate literal of range: <http://example.org1/MyCustomDataType>"
    );
  });

});
