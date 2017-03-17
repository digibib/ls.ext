#!/usr/bin/env ruby
# encoding: utf-8
# This set of simple structs represents the @context objects

require 'rdf'
require 'securerandom'
require 'faker'

def generateRandomString ()
  return SecureRandom.hex(4)
end

Book = Struct.new(:title, :biblionumber, :items) do
  def initialize
    self.title   = generateRandomString
    self.items   = []
  end

  def addItem
    self.items << Item.new
  end
end unless defined?(Book)

# RDF vocabularies
class DEICH < RDF::Vocabulary("http://data.deichman.no/");end
class ONTOLOGY < RDF::Vocabulary("http://data.deichman.no/ontology#");end
class DUO < RDF::Vocabulary("http://data.deichman.no/utility#");end
class MEDIATYPE < RDF::Vocabulary("http://data.deichman.no/mediaType#");end
class AUDIENCE < RDF::Vocabulary("http://data.deichman.no/audience#");end
class LANGUAGE < RDF::Vocabulary("http://data.deichman.no/language#");end
class ROLE < RDF::Vocabulary("http://data.deichman.no/role#");end


Resource = Struct.new(:uri, :literals, :ontology, :type) do
  def self.type_from_name(name)
    { 'verk' => 'Work',
      'utgivelse' => 'Publication',
      'person' => 'Person'}[name]
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

  def gen_literals(type)
    # Get domains of type ("Work", "Publication", etc.)
    domains = self.ontology.statements.select do |s|
      s.predicate == RDF::RDFS.domain && s.object == ONTOLOGY[type]
    end

    # Collect subjects in domain
    subs = domains.collect {|d| d.subject}

    # Now filter out the range of type within this domain
    range = self.ontology.statements.select do |s|
      s.predicate == RDF::RDFS.range && subs.include?(s.subject)
    end

    # Create literals
    range.each do |stmt|
      # dont set recordId, created and modified, it is set by Koha and services
      next if ([ONTOLOGY.recordId, ONTOLOGY.created, ONTOLOGY.modified]).include?(stmt.subject)
      if ["xsd:gYear", "xsd:dateTime", "xsd:nonNegativeInteger", "xsd:string", "xsd:boolean"].include?(stmt.object.pname)
        lit = random_literal(stmt)
        if lit
          self.literals << RDF::Statement.new(
            RDF::URI.new(self.uri),
            stmt.subject,
            RDF::Literal(lit)
          )
        end
      end
    end
  end

  def random_literal(stmt)
    case stmt.object.pname
    when "xsd:gYear" then rand(2016).to_s
    when "xsd:dateTime" then Faker::Date.birthday.to_time
    when "xsd:nonNegativeInteger" then rand(9999).to_s
    when "xsd:boolean" then (rand(2) == 1).to_s
    when "xsd:string"
      case stmt.subject.pname
      when "ontology:mainTitle"
        Faker::Code.asin + " " + Faker::Book.title
      when "ontology:partTitle", "ontology:subtitle" then Faker::Book.title
      when "ontology:isbn" then Faker::Code.isbn
      when "ontology:hasEan" then Faker::Code.ean
      when "ontology:edition" then Faker::Cat.name
      when "numberOfPages" then Faker::Food.ingredient
      when "ontology:name" then Faker::Superhero.name
      when "ontology:alternativeName" then Faker::Name.job_titles.sample
      when "ontology:personTitle" then Faker::Name.title
      when "ontology:locationSignature" then Faker::StarWars.quote
      when "ontology:hasDescription" then Faker::RockBand.name
      when "ontology:hasSummary" then Faker::ChuckNorris.fact
      when "ontology:specification" then Faker::Beer.name
      else
        generateRandomString
      end
    else
      generateRandomString
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
  def initialize(code='hutl', name='Hovedbiblioteket')
    self.code   = code
    self.name   = name
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
