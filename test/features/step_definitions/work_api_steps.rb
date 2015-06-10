# encoding: UTF-8

require 'rdf/turtle'
require_relative '../support/services/work_api/client.rb'
require_relative '../support/context_structs.rb'

Given(/^at jeg har en ontologi som beskriver verk$/) do
  client = WorkAPIClient.new()
  work_statement = RDF::Statement::new(
    RDF::URI.new("#{client.addr}/ontology#Work"),
    RDF::URI.new("http://www.w3.org/1999/02/22-rdf-syntax-ns#type"),
    RDF::URI.new("http://www.w3.org/2000/01/rdf-schema#Class")
      )
  @context[:ontology] = client.get_ontology()
  @context[:ontology].has_statement?(work_statement).should be true
end

When(/^jeg legger inn et verk via APIet$/) do
  w = Work.new(@context[:ontology])
  w.uri = WorkAPIClient.new().create_work(w.literals)
  @context[:work] = w
  @cleanup.push( "verk #{w.uri}" =>
    lambda do
      # TODO uncomment when DELETE /work route in service API is implemented
      # client = WorkAPIClient.new().remove_work(w.uri)
     end
     )
end

Then(/^viser APIet at verket finnes$/) do
  client = WorkAPIClient.new()
  stmt = RDF::Statement::new(
    RDF::URI.new(@context[:work].uri),
    RDF::URI.new("http://www.w3.org/1999/02/22-rdf-syntax-ns#type"),
    RDF::URI.new("#{client.addr}/ontology#Work")
      )
  client.get_work(@context[:work].uri).has_statement?(stmt).should be true
end
