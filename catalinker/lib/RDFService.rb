require 'rdf'

class RDFService

  @current_model = nil

  def get_model
    return @current_model
  end

  def new_model
    if @current_model == nil
      @current_model = RDF::Graph.new
    end
  end

  def add_triple (s, p, o)
    statement = RDF::Statement.new(s, p, o)
    @current_model << statement 
  end

  def get_JSONLD
    return @current_model.dump(:jsonld, standard_prefixes: true)
  end

  def initialize
  	new_model
  end

end