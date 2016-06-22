# encoding: UTF-8

require 'json/ld'
require 'uri'
require 'net/http'
require 'rdf'

require_relative '../service.rb'

class ServicesAPIClient < Service
  def initialize()
  end

  def addr
    "http://services:#{port(:services)}"
  end

  def get_ontology()
    RDF::Graph.load("#{self.addr}/ontology", format: :jsonld)
  end

  def create_resource(resource_type, statements)
    uri = URI("#{self.addr}/#{resource_type.to_s}")
    req = Net::HTTP::Post.new(uri.path)
    req.add_field('Content-Type', 'application/ld+json')
    req.body = statements.dump(:jsonld, :standard_prefixes => true)
    res =  Net::HTTP.new(uri.host, uri.port).request(req)
    expect(res.code).to eq("201"), "got unexpected #{res.code} when creating resource"
    res['location']
  end

  def get_resource(resource)
    u = URI.parse(resource)
    RDF::Graph.load(URI("#{self.addr}#{u.path}"), format: :jsonld)
  end

  def patch_resource(resource, statements, op="add")
    patches = []
    statements.each { |stmt|
      patches << {:op => op,
                  :s => stmt.subject,
                  :p => stmt.predicate,
                  :o => { :value => stmt.object.uri? ? stmt.object.value : stmt.object,
                          :type => (stmt.object.uri? || stmt.object.node?) ? "http://www.w3.org/2001/XMLSchema#anyURI" : stmt.object.datatype}
      }
    }
    uri = URI(resource)
    req = Net::HTTP::Patch.new(uri.path)
    req.add_field('Content-Type', 'application/ldpatch+json')
    req.body = patches.to_json
    res = Net::HTTP.new("services", port(:services)).request(req)
    expect(res.code).to eq("200"), "got unexpected #{res.code} when patching resource"
    res
  end

  def remove_resource(resource)
    uri = URI(resource)
    res = Net::HTTP::new("services", port(:services)).delete(uri.path)
    expect(res.code).to eq("204"), "got unexpected #{res.code} when removing resource"
    res
  end
end
