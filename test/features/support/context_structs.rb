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
end

Work = Struct.new(:uri, :literals, :ontology) do
  def randomizer
    {
      RDF::XSD.string => generateRandomString,
      RDF::XSD.gYear => rand(2015),
      RDF::XSD.nonNegativeInteger => rand(9999)
    }
  end

  def initialize(ontology)
    self.literals = RDF::Graph.new
    self.ontology = ontology
    self.ontology.each_statement do |stmt|
      if stmt.predicate == RDF::URI.new("http://www.w3.org/2000/01/rdf-schema#range");
        if randomizer[stmt.object]
          self.literals << RDF::Statement.new(
            RDF::URI.new(""), # We don't have any id for our work yet
            stmt.subject,
            randomizer[stmt.object]
            )
        end
      end
    end
  end
end

Item = Struct.new(:barcode, :itemnumber, :branch, :itemtype) do
  def initialize
    self.barcode  = '0301%010d' % rand(10 ** 10)
    self.branch   = Branch.new
    self.itemtype = ItemType.new
  end
end

Branch = Struct.new(:code, :name) do
  def initialize
    self.code   = generateRandomString
    self.name   = generateRandomString
  end
end

ItemType = Struct.new(:code, :desc) do
  def initialize
    self.code   = generateRandomString.upcase
    self.desc   = generateRandomString
  end
end

Patron = Struct.new(:firstname, :surname, :borrowernumber, :cardnumber, :branch, :category, :password, :debarred) do
  def initialize
    self.cardnumber = generateRandomString
    self.surname    = generateRandomString
    self.branch     = Branch.new
    self.category   = PatronCategory.new
    self.debarred   = false
  end
end

PatronCategory = Struct.new(:code, :name, :description) do
  def initialize
    self.code        = generateRandomString.upcase
    self.name        = generateRandomString
    self.description = generateRandomString
  end
end