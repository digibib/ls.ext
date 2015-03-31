require 'rdf'

class RDFService

  @currentModel = nil

  def getModel
    return @currentModel
  end

  def newModel
    if @currentModel == nil
      @currentModel = RDF::Graph.new
    end
  end

  def addTriple (s, p, o)
    subject = RDF::URI.new(s)
    predicate = RDF::URI.new(p)
    object = RDF::URI.new(o)
    statement = RDF::Statement.new(subject, predicate, object)
    @currentModel << statement 
  end

  def getJSONLD
    return @currentModel.dump(:jsonld, standard_prefixes: true)
  end

end