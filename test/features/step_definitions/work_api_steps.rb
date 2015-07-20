# encoding: UTF-8

require_relative '../support/services/work_api/client.rb'
require_relative '../support/context_structs.rb'

Given(/^at jeg har en ontologi som beskriver (verk|utgivelse)$/) do | onto_class |
  class_map = { 'verk' => 'Work', 'utgivelse' => 'Publication'}
  class_name = class_map[onto_class]

  client = ServicesAPIClient.new()
  class_statement = RDF::Statement::new(
    RDF::URI.new("#{client.addr}/ontology##{class_name}"),
    RDF::URI.new("http://www.w3.org/1999/02/22-rdf-syntax-ns#type"),
    RDF::URI.new("http://www.w3.org/2000/01/rdf-schema#Class")
      )
  @context[:ontology] = client.get_ontology()
  @context[:ontology].has_statement?(class_statement).should be true
end

When(/^jeg legger inn et verk via APIet$/) do
  w = Work.new(@context[:ontology])
  w.uri = ServicesAPIClient.new().create_work(w.literals)
  @context[:work] = w
  @cleanup.push( "verk #{w.uri}" =>
    lambda do
      client = ServicesAPIClient.new().remove_work(w.uri)
     end
     )
end

Then(/^viser APIet at verket finnes$/) do
  client = ServicesAPIClient.new()
  stmt = RDF::Statement::new(
    RDF::URI.new(@context[:work].uri),
    RDF::URI.new("http://www.w3.org/1999/02/22-rdf-syntax-ns#type"),
    RDF::URI.new("#{client.addr}/ontology#Work")
      )
  client.get_work(@context[:work].uri).has_statement?(stmt).should be true
end

Given(/^at det er opprettet et verk$/) do
  steps %Q{
     Gitt at jeg har en ontologi som beskriver verk
     Når jeg legger inn et verk via APIet
  }
end

When(/^jeg sender inn endringer til APIet$/) do
  @context[:work].gen_literals
  w = @context[:work]
  ServicesAPIClient.new().patch_work(w.uri, w.literals)
end

Then(/^viser APIet at endringene er lagret$/) do
  res = ServicesAPIClient.new().get_work(@context[:work].uri)
  @context[:work].literals.each do |stmt|
    res.has_statement?(stmt).should be true
  end
end
