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
    test = repo.load('./tests/data/work_0001.nt')

    query = RDF::Query.new({
      :id => {
        rdf.type  => :type,
        dcterms.creator => :creator,
        dcterms.title => :title,
        dcterms.date => :date,
        deichman.biblioId => :biblio
      }
    })

    data = nil

    query.execute(repo) do |solution|
      data = {
          :id => solution.id.to_s.gsub('http://deichman.no/work/',''),
          :creator => solution.creator.to_s,
          :title => {
            :string => solution.title,
            :language => solution.title.language
          },
          :date => {
              :string => solution.date,
              :datatype => solution.date.datatype
          },
          :biblio => solution.biblio.to_s
      }
    end

    output = WorkModel.fromData(data)
    iso = test.isomorphic? output

    assert(iso == true, "The round-tripped models were not the same: #{iso}")
  end

end
