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
    statement = RDF::Statement.new(s, p, o)
    @currentModel << statement 
  end

  def getJSONLD
    return @currentModel.dump(:jsonld, standard_prefixes: true)
  end

end