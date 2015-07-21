# encoding: UTF-8

require 'json/ld'
require 'uri'
require 'net/http'

require_relative '../service.rb'

class ServicesAPIClient < Service
  def initialize()
  end

  def addr
    "http://#{host}:#{port(:services)}"
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
    RDF::Graph.load(URI(resource), format: :jsonld)
  end

  def patch_work(work, statements)
    patches = []
    statements.each { |stmt|
      patches << {:op => "add",
                  :s => stmt.subject,
                  :p => stmt.predicate,
                  :o => {:value => stmt.object } }
    }
    uri = URI(work)
    req = Net::HTTP::Patch.new(uri.path)
    req.add_field('Content-Type', 'application/ldpatch+json')
    req.body = patches.to_json
    res =  Net::HTTP.new(uri.host, uri.port).request(req) 
  end

  def remove_resource(resource)
    uri = URI(resource)
    res = Net::HTTP::new(uri.host, uri.port).delete(uri.path)
    expect(res.code).to eq("204"), "got unexpected #{res.code} when removing resource"
    res
  end
end
