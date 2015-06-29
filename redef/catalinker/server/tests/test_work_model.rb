ENV['RACK_ENV'] = 'test'
require_relative '../lib/work_model'
require 'test/unit'
require 'rack/test'
require 'rdf'
require 'rdf/turtle'
require 'rdf/isomorphic'

class TestWorkModel < Test::Unit::TestCase
  include Rack::Test::Methods

  def test_it_can_create_complete_work

    dcterms = RDF::Vocabulary.new("http://purl.org/dc/terms/")
    rdf = RDF::Vocabulary.new("http://www.w3.org/1999/02/22-rdf-syntax-ns#")
    deichman = RDF::Vocabulary.new("http://deichman.no/ontology#")

    repo = RDF::Repository.new
    input = repo.load('./tests/data/work_0001.nt')

    query = RDF::Query.new({
      :id => {
        rdf.type  => :type,
        deichman.creator => :creator,
        deichman.title => :title,
        deichman.date => :date,
        deichman.biblio => :biblio
      }
    })

    data = nil

    query.execute(repo) do |solution|
      data = {
          :id => solution.id.to_s.gsub(/http:\/\/.*\/work\//,''),
          :creator => solution.creator.to_s,
          :title => solution.title.to_s,
          :date => solution.date.to_s,
          :biblio => solution.biblio.to_s
      }
    end

    puts data

    output = WorkModel.fromData(data)
    iso = input.isomorphic? output

    assert(iso == true, "The round-tripped models were not the same: #{iso}")
  end

end
