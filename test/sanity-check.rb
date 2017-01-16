#!/usr/bin/env ruby
# encoding: utf-8

require "net/http"
require "uri"

Ports = {
  :koha_intra => { :host => "xkoha", :port => "8081", :path =>'/' },
  :koha_api => { :host => "xkoha", :port => "8081", :path => "/api/v1/spec"},
  :services => { :host => "services", :port => "8005", :path =>'/application.wadl?detail=true' },
  :patron_client_search => { :host => "patron_client", :port => "8000", :path =>'/' },
  :patron_client_person => { :host => "patron_client", :port => "8000", :path =>'/person/dummyid' },
  :patron_client_work => { :host => "patron_client", :port => "8000", :path =>'/work/dummyid' },
  :catalinker => { :host => "catalinker", :port => "8010", :path =>'/cataloguing' },
  :elasticsearch => { :host => "elasticsearch", :port => "9200", :path =>'/' }
}

failed = []

STDOUT.puts "------ SANITY CHECKING LS.EXT SERVICES -------"
Ports.each do | name, service |
  begin
    uri = URI.parse("http://#{service[:host]}:#{service[:port]}#{service[:path]}")
    STDOUT.puts "  checking #{name}: #{uri}"
    response = Net::HTTP.get_response(uri)
    if response.code == "200"
      STDOUT.puts "  -------> OK"
    else
      failed << name
      STDOUT.puts "  -------> FAILED"
      STDERR.puts response.body
    end
  rescue => e
    STDERR.puts e
    failed << name
  end
end

exit 1 unless failed.empty?
