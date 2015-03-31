ENV['RACK_ENV'] = 'test'
require_relative '../lib/RDFService'
require 'test/unit'
require 'rack/test'
require 'rdf'

class RDFServiceTest < Test::Unit::TestCase
  include Rack::Test::Methods

  def test_it_can_create_work_data
  	s = "http://deichman.no/work/test_1234"
  	p = "http://www.w3.org/1999/02/22-rdf-syntax-ns#type"
  	o = "http://deichman.no/vocab/Work"
  	r = RDFService.new
    r.newModel
  	r.addTriple(s, p, o);
  	g = r.getModel
  	assert(g.has_statement?(RDF::Statement.new(RDF::URI.new(s), RDF::URI.new(p), RDF::URI.new(o))), "Model did not contain expected work data")
  end

end
