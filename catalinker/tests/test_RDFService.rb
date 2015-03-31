ENV['RACK_ENV'] = 'test'
require_relative '../lib/RDFService'
require 'test/unit'
require 'rack/test'
require 'rdf'
require 'json/ld'

class RDFServiceTest < Test::Unit::TestCase
  include Rack::Test::Methods

  @@s = RDF::URI.new("http://deichman.no/work/test_1234")
  @@p = RDF::URI.new("http://www.w3.org/1999/02/22-rdf-syntax-ns#type")
  @@o = RDF::URI.new("http://deichman.no/vocab/Work")

  def populateStore (rdfservice, s, p, o)
    rdfservice.newModel
    rdfservice.addTriple(s, p, o);
    g = rdfservice.getModel
    return g
  end

  def test_it_can_create_work
    rdfservice = RDFService.new
    g = populateStore(rdfservice, @@s, @@p, @@o)
    assert(
      g.has_statement?(
        RDF::Statement.new(@@s, 
        @@p, 
        @@o)
      ), 
    "Model did not contain expected work data")
  end

  def test_it_can_create_item_reference
  	p = RDF::URI.new("http://deichman.no/vocab/hasManifestation")
  	o = RDF::URI.new("http://deichman.no/item/test_1234")
    rdfservice = RDFService.new
    g = populateStore(rdfservice, @@s, p, o)
    assert(
      g.has_statement?(
        RDF::Statement.new(@@s, 
        p, 
        o)
      ), 
    "Model did not contain expected work data")
  end 

  def test_it_can_create_author_reference
  	p = RDF::URI.new("http://purl.org/dc/terms/creator")
  	o = RDF::URI.new("http://deichman.no/person/test_1234")
    rdfservice = RDFService.new
    g = populateStore(rdfservice, @@s, p, o)
    assert(
      g.has_statement?(
        RDF::Statement.new(@@s, 
        p, 
        o)
      ), 
    "Model did not contain expected work data")
  end 
  
  def test_it_can_create_title
  	p = RDF::URI.new("http://purl.org/dc/terms/title")
  	o = RDF::Literal.new("The meaning of Liff", :language => :no)
    rdfservice = RDFService.new
    g = populateStore(rdfservice, @@s, p, o)
    assert(
      g.has_statement?(
        RDF::Statement.new(@@s, 
        p, 
        o)
      ), 
    "Model did not contain expected work data")
  end
  
  def test_it_can_provide_JSONLD
    rdfservice = RDFService.new
    g = populateStore(rdfservice, @@s, @@p, @@o)
    json = rdfservice.getJSONLD
    RDF::Reader.for(:jsonld).new(json) do |reader|
      reader.each_statement do |statement|
        assert(
          g.has_statement?(statement), 
        "Model did not contain expected work data")
      end
    end
  end

end
