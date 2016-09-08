# encoding: UTF-8

require 'rest-client'
require 'nokogiri'
Given(/^at tingen finnes i biblioteket$/) do
  step "at boka finnes i biblioteket"
end

When(/^jeg leter opp en ting i katalogiseringssøk$/) do
  step "jeg leter opp boka i katalogiseringssøk"
end

When(/^jeg migrerer en utgivelse med tilknyttet verk som har tittel og forfatter$/) do
  publication_name = generateRandomString
  ntriples = "<http://data.deichman.no/publication/p1> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://data.deichman.no/ontology#Publication> .
              <http://data.deichman.no/publication/p1> <http://data.deichman.no/ontology#publicationOf> <#{@context[:work_identifier]}> .
              <http://data.deichman.no/publication/p1> <http://data.deichman.no/ontology#mainTitle> \"#{publication_name}\" ."
  post_publication_ntriples publication_name, ntriples
end

When(/^jeg migrerer en utgivelse med tilknyttet verk som har tittel, forfatter og items$/) do
  publication_title = generateRandomString
  ntriples = "<http://data.deichman.no/publication/p1> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://data.deichman.no/ontology#Publication> .
              <http://data.deichman.no/publication/p1> <http://data.deichman.no/ontology#publicationOf> <#{@context[:work_identifier]}> .
              <http://data.deichman.no/publication/p1> <http://data.deichman.no/ontology#mainTitle> \"#{publication_title}\" ."
  post_publication_ntriples publication_title, ntriples
end

def post_publication_ntriples(publication_title, ntriples)
  response = RestClient.post "http://services:8005/publication", ntriples, :content_type => 'application/n-triples'
  response.code.should == 201
  @context[:publication_identifier] = response.headers[:location]
  @context[:publication_recordid] = JSON.parse(RestClient.get(proxy_to_services(@context[:publication_identifier])))["deichman:recordID"]
  @context[:publication_maintitle] = publication_title
end

When(/^jeg sjekker om tittelen finnes i MARC-dataene til utgivelsen$/) do
  response = RestClient.get "http://services:8005/marc/#{@context[:publication_recordid]}"
  xml_doc = Nokogiri::XML response
  title = xml_doc.xpath("//xmlns:datafield[@tag=245]/xmlns:subfield[@code='a']").text
  title.should == @context[:publication_maintitle]
end

When(/^jeg sjekker om forfatteren finnes i MARC-dataene til utgivelsen$/) do
  response = RestClient.get "http://services:8005/marc/#{@context[:publication_recordid]}"
  xml_doc = Nokogiri::XML response
  creator = xml_doc.xpath("//xmlns:datafield[@tag=100]/xmlns:subfield[@code='a']").text
  creator.should == @context[:person_name]
end

When(/^jeg sørger for at utgivelsen er synkronisert i Koha$/) do
  if @context[:publication_identifier].to_s.empty?
    fail
  end
  id = @context[:publication_identifier]
  id = id[id.rindex("/")...id.length]
  response = RestClient.put "http://services:#{port(:services)}/publication#{id}/sync", {}
  response.code.should == 202
end