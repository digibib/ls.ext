require 'rdf'
require_relative './rdf_repo'

class WorkModel

  BASE = 'http://deichman.no/work/'
  DCTERMS = 'http://purl.org/dc/terms/'
  DEICHMAN = 'http://deichman.no/ontology#'
  TYPE = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type'

  def self.fromData(data)
    id = data[:id]
    creator = data[:creator]
    title = data[:title]
    date = data[:date]
    biblio = data[:biblio]

    s = RDF::URI.new(BASE + id)

    repo = RDFRepo.new
    repo.add_triple(s, RDF::URI.new(TYPE), RDF::URI.new(DEICHMAN + 'Work'))
    repo.add_triple(s, RDF::URI.new(DCTERMS + 'identifier'), RDF::Literal.new(id))
    repo.add_triple(s, RDF::URI.new(DCTERMS + 'creator'), RDF::URI.new(creator)) unless creator.empty?
    repo.add_triple(s, RDF::URI.new(DCTERMS + 'title'), RDF::Literal.new(title[:string], :language => title[:language])) unless title.empty?
    repo.add_triple(s, RDF::URI.new(DCTERMS + 'date'), RDF::Literal.new(date[:string], :datatype => date[:datatype])) unless date.empty?
    repo.add_triple(s, RDF::URI.new(DEICHMAN + 'biblioId'), RDF::Literal.new(biblio)) unless biblio.empty?

    repo.get_model
  end

end