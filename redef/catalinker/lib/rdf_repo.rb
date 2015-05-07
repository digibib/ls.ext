require 'rdf'

class RDFRepo

  def initialize
    @repo = RDF::Repository.new
  end

  def get_model
    @repo
  end

  def add_triple (s, p, o)
    @repo.insert([s, p, o])
    self
  end

  def to_jsonld
    @repo.dump(:jsonld, standard_prefixes: true)
  end
end