# encoding: UTF-8

require 'rest-client'
require 'nokogiri'

Given(/^at jeg er på side for materialtypeadministrasjon i administrasjonsgrensesnittet$/) do
  @site.ItemTypes.visit.show_all
end

Then(/^ser jeg at følgende materialtyper er tilgjengelig$/) do |table|
  d = @browser.table :id => 'table_item_type'
  p = d.hashes
  #Need to remove &nbsp; from captured data values
  p.each { |x|
    x.each { |k, v|
      if /^\s$/.match(v)
        x.update({k => ""})
      end
    }
  }
  table.diff!(p)
end

Given(/^at tingen finnes i biblioteket$/) do
  step "at boka finnes i biblioteket"
end

When(/^jeg leter opp en ting i katalogiseringssøk$/) do
  step "jeg leter opp boka i katalogiseringssøk"
end

Then(/^kan jeg velge å endre materialtypen til "(.*?)"$/) do |type|
  step "velger å redigere eksemplaret"
  s = @browser.select_list(:id => /^tag_952_subfield_y_[0-9]+$/)
  s.select "#{type}"
end


When(/^jeg migrerer en utgivelse med tilknyttet verk som har tittel og forfatter$/) do
  publication_name = generateRandomString
  ntriples = "<publication> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://192.168.50.12:8005/ontology#Publication> .
              <publication> <http://192.168.50.12:8005/ontology#publicationOf> <#{@context[:identifier]}> .
              <publication> <http://192.168.50.12:8005/ontology#title> \"#{publication_name}\" ."
  post_publication_ntriples publication_name, ntriples
end

When(/^jeg migrerer en utgivelse med tilknyttet verk som har tittel, forfatter og items$/) do
  publication_name = generateRandomString
  ntriples = "<publication> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://192.168.50.12:8005/ontology#Publication> .
              <publication> <http://192.168.50.12:8005/ontology#publicationOf> <#{@context[:identifier]}> .
              <publication> <http://192.168.50.12:8005/ontology#hasItem> <http://item> .
              <http://item> <http://192.168.50.12:8005/itemSubfieldCode/a> \"test\" .
              <publication> <http://192.168.50.12:8005/ontology#title> \"#{publication_name}\" ."
  post_publication_ntriples publication_name, ntriples
end

def post_publication_ntriples(publication_name, ntriples)
  response = RestClient.post "http://192.168.50.12:8005/publication", ntriples, :content_type => 'application/n-triples'
  @context[:record_id] = JSON.parse(RestClient.get(response.headers[:location]))["deichman:recordID"]
  @context[:publication_title] = publication_name
end

When(/^jeg sjekker om tittelen finnes i MARC-dataene til utgivelsen$/) do
  response = RestClient.get "http://192.168.50.12:8005/marc/#{@context[:record_id]}"
  xml_doc = Nokogiri::XML response
  title = xml_doc.xpath("//xmlns:datafield[@tag=245]/xmlns:subfield[@code='a']").text
  title.should == @context[:publication_title]
end

When(/^jeg sjekker om forfatteren finnes i MARC-dataene til utgivelsen$/) do
  response = RestClient.get "http://192.168.50.12:8005/marc/#{@context[:record_id]}"
  xml_doc = Nokogiri::XML response
  creator = xml_doc.xpath("//xmlns:datafield[@tag=100]/xmlns:subfield[@code='a']").text
  creator.should == @context[:person_name]
end