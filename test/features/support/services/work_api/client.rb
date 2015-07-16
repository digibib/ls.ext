# encoding: UTF-8

require 'json/ld'
require 'uri'
require 'net/http'

require_relative '../service.rb'

class WorkAPIClient < Service
  def initialize()
  end

  def addr
    "http://#{host}:#{port(:services)}"
  end

  def get_ontology()
    RDF::Graph.load("#{self.addr}/ontology", format: :jsonld)
  end

  def create_work(statements)
    uri = URI("#{self.addr}/work")
    req = Net::HTTP::Post.new(uri.path)
    req.add_field('Content-Type', 'application/ld+json')
    req.body = statements.dump(:jsonld, :standard_prefixes => true)
    res =  Net::HTTP.new(uri.host, uri.port).request(req)
    res['location']
  end

  def get_work(work)
    RDF::Graph.load(URI(work), format: :jsonld)
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
    req.add_field('Content-Type', 'application/ld+json')
    req.body = patches.to_json
    res =  Net::HTTP.new(uri.host, uri.port).request(req) 
  end

  def remove_work(work)
    uri = URI(work)
    Net::HTTP::new(uri.host, uri.port).delete(uri.path)
  end
end
