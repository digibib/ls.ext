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
    req.add_field('Content-Type', 'application/json')
    req.body = statements.dump(:jsonld, :standard_prefixes => true)
    res =  Net::HTTP.new(uri.host, uri.port).request(req)
    res['location']
  end

  def get_work(work)
    RDF::Graph.load(URI(work), format: :jsonld)
  end

  def patch_work(diff)
    # TODO
  end

  def remove_work(work)
    Net::HTTP::new(host, port(:services)).delete("/work/#{work}")
  end
end
