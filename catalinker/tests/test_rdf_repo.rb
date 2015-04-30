ENV['RACK_ENV'] = 'test'
require_relative '../lib/rdf_repo'
require 'test/unit'
require 'rack/test'
require 'rdf'
require 'json/ld'

class TestRDFRepo < Test::Unit::TestCase
  include Rack::Test::Methods

  S = RDF::URI.new("http://deichman.no/work/test_1234")
  P = RDF::URI.new("http://www.w3.org/1999/02/22-rdf-syntax-ns#type")
  O = RDF::URI.new("http://deichman.no/vocab/Work")


  def test_it_can_create_work
    g = RDFRepo.new.add_triple(S, P, O).get_model
    assert g.has_statement?(RDF::Statement.new(S, P, O)), "repo did not contain expected work data"
  end

  def test_it_can_provide_JSONLD
    repo = RDFRepo.new
    g = repo.add_triple(S, P, O).get_model
    json = repo.to_jsonld
    RDF::Reader.for(:jsonld).new(json) do |reader|
      reader.each_statement do |statement|
        assert g.has_statement?(statement), "repo did not contain expected work data"
      end
    end
  end

end
