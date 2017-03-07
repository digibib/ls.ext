# encoding: UTF-8

require_relative '../support/services/resource_api/client.rb'
require_relative '../support/context_structs.rb'

Given(/^at jeg har en ontologi som beskriver (verk|utgivelse)$/) do | resource_name |
  client = ServicesAPIClient.new()
  class_statement = RDF::Statement::new(
    RDF::URI.new("http://data.deichman.no/ontology##{Resource.type_from_name(resource_name)}"),
    RDF::URI.new("http://www.w3.org/1999/02/22-rdf-syntax-ns#type"),
    RDF::URI.new("http://www.w3.org/2000/01/rdf-schema#Class")
      )
  @context[:ontology] = client.get_ontology()
  @context[:ontology].has_statement?(class_statement).should be true
end

When(/^jeg legger inn (?:et|en) (verk|utgivelse) via APIet$/) do | resource_name |
  resource = Resource.new(@context[:ontology], Resource.sym_from_name(resource_name))
  @context[resource.type] = resource
  resource.uri = ServicesAPIClient.new().create_resource(resource.type, resource.literals)
  @context[:resourceURI] = resource.uri
  @cleanup.push( "#{resource.type} #{resource.uri}" =>
    lambda do
      ServicesAPIClient.new().remove_resource(resource.uri)
     end
     )
end

Then(/^viser APIet at (verk|utgivelse)(?:et|n) finnes$/) do | resource_name |
  client = ServicesAPIClient.new()
  resource_to_look_for = @context[Resource.sym_from_name(resource_name)]
  stmt = RDF::Statement::new(
      RDF::URI.new(resource_to_look_for.uri),
      RDF::URI.new("http://www.w3.org/1999/02/22-rdf-syntax-ns#type"),
      RDF::URI.new("http://data.deichman.no/ontology##{Resource.type_from_name(resource_name)}")
  )
  client.get_resource(resource_to_look_for.uri).has_statement?(stmt).should be true
end

Given(/^at det er opprettet (?:et|en) (verk|utgivelse)$/) do | resource_name |
  steps %Q{
     Gitt at jeg har en ontologi som beskriver #{resource_name}
     Når jeg legger inn et #{resource_name} via APIet
  }
end

When(/^jeg sender inn endringer i (verk|utgivelse)(?:et|n) til APIet$/) do | resource_name |
  @context[Resource.sym_from_name(resource_name)].gen_literals(Resource.type_from_name(resource_name))
  r = @context[Resource.sym_from_name(resource_name)]
  ServicesAPIClient.new().patch_resource(r.uri, r.literals)
end

Then(/^viser APIet at endringene i (verk|utgivelse)(?:et|n) er lagret$/) do | resource_name |
  r = @context[Resource.sym_from_name(resource_name)]
  res = ServicesAPIClient.new().get_resource(r.uri)
  r.literals.each do |stmt|
    res.has_statement?(stmt).should be true
  end
end

When(/^kopler utgivelsen til verket$/) do
  statements = Array.new
  property = Resource.get_named_property("Publication of",@context[:ontology])
  statements[0] = RDF::Statement.new(
            RDF::URI.new(@context[:publication].uri),
            RDF::URI.new(property),
            RDF::URI.new(@context[:work].uri)
          )

  ServicesAPIClient.new().patch_resource(@context[:publication].uri,statements)
  @context[:pubWorkStmt] = statements
end

Then(/^viser APIet at verket har opplysninger om utgivelsen$/) do
  res = ServicesAPIClient.new().get_resource(@context[:work].uri)
  @context[:pubWorkStmt].each do |stmt|
    res.has_statement?(stmt).should be true
  end
end
