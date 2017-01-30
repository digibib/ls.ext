#!/usr/bin/env ruby
# encoding: utf-8
# This set of simple structs represents the @context objects

require 'rdf'


Book = Struct.new(:title, :biblionumber, :items) do
  def initialize
    self.title   = generateRandomString
    self.items   = []
  end

  def addItem
    self.items << Item.new
  end
end unless defined?(Book)

Resource = Struct.new(:uri, :literals, :ontology, :type) do
  def self.type_from_name(name)
    { 'verk' => 'Work',
      'utgivelse' => 'Publication'}[name]
  end

  def self.sym_from_name(name)
    self.type_from_name(name).downcase.to_sym
  end

  def randomizer
    {
      RDF::XSD.string => generateRandomString,
      RDF::XSD.gYear => rand(2015).to_s,
      RDF::XSD.nonNegativeInteger => rand(9999).to_s
    }
  end

  def initialize(ontology, resource_sym)
    self.type = resource_sym
    self.literals = RDF::Graph.new
    self.ontology = ontology
  end

  def self.get_named_property(property_name, ontology)
    graph = ontology
    query = RDF::Query.new({
      :property => {
        RDF::RDFS.label => RDF::Literal.new(property_name, :language => :en)
      }
    })
    arr = Array.new
    query.execute(graph) do | solution |
      arr.push solution.property
    end
    arr[0].value
  end

  def gen_literals
    # TODO Fix me - I generate triples that don't apply!
    self.ontology.each_statement do |stmt|
      if stmt.predicate == RDF::URI.new("http://www.w3.org/2000/01/rdf-schema#range")
        next if stmt.subject.to_s.end_with? "recordId"
        if randomizer[stmt.object]
          self.literals << RDF::Statement.new(
            RDF::URI.new(self.uri),
            stmt.subject,
            randomizer[stmt.object]
          )
        end
      end
    end
  end
end unless defined?(Resource)

Item = Struct.new(:barcode, :itemnumber, :branch, :itemtype) do
  def initialize
    self.barcode  = '0301%010d' % rand(10 ** 10)
    self.branch   = Branch.new
    self.itemtype = ItemType.new
  end
end unless defined?(Item)

Branch = Struct.new(:code, :name) do
  def initialize(code=nil, name=nil)
    self.code   = code ||= generateRandomString
    self.name   = name ||= generateRandomString
  end
end unless defined?(Branch)

ItemType = Struct.new(:code, :desc) do
  def initialize
    self.code   = generateRandomString.upcase
    self.desc   = generateRandomString
  end
end unless defined?(ItemType)

Patron = Struct.new(:firstname, :surname, :borrowernumber, :cardnumber, :branch, :category, :password, :debarred, :userid, :email, :dateenrolled, :dateexpiry, :mobile, :address, :zipcode, :city) do
  def initialize
    self.cardnumber = generateRandomString
    self.surname    = generateRandomString
    self.userid     = generateRandomString
    self.email      = generateRandomString + "@" + generateRandomString + ".dot"
    self.branch     = Branch.new
    self.category   = PatronCategory.new
    self.debarred   = false
    self.dateenrolled = Time.now.strftime('%F')
    self.dateexpiry = (Time.now + (4*7*24*60*60)).strftime('%F')
    self.mobile = '%08d' % rand(10**8)
    self.address = generateRandomString
    self.zipcode = '%04d' % rand(10000)
    self.city = (0...8).map { (65 + rand(26)).chr }.join
  end
end unless defined?(Patron)

PatronCategory = Struct.new(:code, :name, :description) do
  def initialize(code=nil, name=nil, description=nil)
    self.code        = code ||= generateRandomString.upcase
    self.name        = name ||= generateRandomString
    self.description = description ||= generateRandomString
  end
end unless defined?(PatronCategory)
