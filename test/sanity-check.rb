#!/usr/bin/env ruby
# encoding: utf-8

require "net/http"
require "uri"

HOST = ENV["HOST"] || "192.168.50.12"
Ports = {
  :koha_opac =>  { :port => "8080", :path =>'/' },
  :koha_intra => { :port => "8081", :path =>'/' },
  :services => { :port => "8005", :path =>'/application.wadl?detail=true' },
  :patron_client_search => { :port => "8000", :path =>'/' },
  :patron_client_person => { :port => "8000", :path =>'/person/dummyid' },
  :patron_client_work => { :port => "8000", :path =>'/work/dummyid' },
  :catalinker => { :port => "8010", :path =>'/' },
  :elasticsearch => { :port => "8200", :path =>'/' }
}

failed = []

STDOUT.puts "------ SANITY CHECKING LS.EXT SERVICES -------"
Ports.each do | name, service |
  begin
    uri = URI.parse("http://#{HOST}:#{service[:port]}#{service[:path]}")
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
