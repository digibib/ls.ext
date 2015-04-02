require 'uri'
require 'rdf'

class RESTService

  @@base = "http://deichman.no/work/"
  @@dcterms = "http://purl.org/dc/terms/"
  @@deichman = "http://deichman.no/vocab/"
  @@type = "http://www.w3.org/1999/02/22-rdf-syntax-ns#type"

  def process_work (data)

    id = data[:id]
    author = data[:author]
    title = data[:title]
    date = data[:date]

    s = RDF::URI.new(@@base + id)

    rdfservice = RDFService.new

    rdfservice.add_triple(s, RDF::URI.new(@@type), RDF::URI.new(@@base + "Work"))

    if !author.empty?
      rdfservice.add_triple(s, RDF::URI.new(@@dcterms + "creator"), RDF::URI.new(author))
    end
    if !title.empty?
      rdfservice.add_triple(s, RDF::URI.new(@@dcterms + "title"), RDF::Literal.new(title[:string], :language => "#{title[:language]}"))
    end
    if !date.empty?
      rdfservice.add_triple(s, RDF::URI.new(@@dcterms + "date"), RDF::Literal.new(date[:string], :datatype => date[:datatype]))
    end

    return rdfservice.get_model

  end

end