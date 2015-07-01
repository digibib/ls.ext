require 'rdf'
require_relative './rdf_repo'

class WorkModel
  
  DEICHMAN = (ENV['SERVICES_PORT'] || 'http://deichman.no').sub(/^tcp:\//, 'http:/' ) + '/ontology#'
  TYPE = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type'

  def self.fromData(data)
    creator = data[:creator]
    title = data[:title]
    date = data[:date]
    biblio = data[:biblio]

    s = RDF::URI.new("http://example.com/placeholder")

    repo = RDFRepo.new
    repo.add_triple(s, RDF::URI.new(TYPE), RDF::URI.new(DEICHMAN + 'Work'))
    repo.add_triple(s, RDF::URI.new(DEICHMAN + 'creator'), RDF::Literal.new(creator)) unless creator.empty?
    repo.add_triple(s, RDF::URI.new(DEICHMAN + 'name'), RDF::Literal.new(title)) unless title.empty?
    repo.add_triple(s, RDF::URI.new(DEICHMAN + 'date'), RDF::Literal.new(date)) unless date.empty?
    repo.add_triple(s, RDF::URI.new(DEICHMAN + 'biblio'), RDF::Literal.new(biblio)) unless biblio.empty?
    repo.get_model
  end

end