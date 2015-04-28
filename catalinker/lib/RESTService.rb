require 'uri'
require 'rdf'
require 'net/http'
require_relative './RDFService'

class RESTService

  @@base = "http://deichman.no/work/"
  @@dcterms = "http://purl.org/dc/terms/"
  @@deichman = "http://deichman.no/ontology#"
  @@type = "http://www.w3.org/1999/02/22-rdf-syntax-ns#type"

  @@uri = "#{ENV['SERVICES_PORT'] ||  "http://192.168.50.50:8080"}/work"

  def process_work (data)

    id = data['id']
    author = data['creator']
    title = data['title']
    date = data['date']
    biblio = data['biblio']

    s = RDF::URI.new(@@base + id)

    rdfservice = RDFService.new
    rdfservice.add_triple(s, RDF::URI.new(@@type), RDF::URI.new(@@deichman + "Work"))
    rdfservice.add_triple(s, RDF::URI.new(@@dcterms + "identifier"), RDF::Literal.new(id))

    if !author.empty?
      rdfservice.add_triple(s, RDF::URI.new(@@dcterms + "creator"), RDF::URI.new(author))
    end
    if !title.empty?
      rdfservice.add_triple(s, RDF::URI.new(@@dcterms + "title"), RDF::Literal.new(title['string'], :language => "#{title['language']}"))
    end
    if !date.empty?
      rdfservice.add_triple(s, RDF::URI.new(@@dcterms + "date"), RDF::Literal.new(date['string'], :datatype => date['datatype']))
    end
    if !biblio.empty?
      rdfservice.add_triple(s, RDF::URI.new(@@deichman + "biblioId"), RDF::Literal.new(biblio))
    end
    return rdfservice.get_model

  end

  def push_work (data)

    uri = URI.parse(@@uri)

    header = {'Content-Type' => 'application/json'}

    http = Net::HTTP.new(uri.host, uri.port)
    request = Net::HTTP::Post.new(uri.request_uri, header)
    request.body = data

    response = http.request(request)

    return response

  end

end