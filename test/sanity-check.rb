#!/usr/bin/env ruby
# encoding: utf-8

require "net/http"
require "uri"
require 'yaml'

REDEF = YAML.load_file('/srv/pillar/redef/init.sls')["redef"]

HOST = ENV["HOST"] || "192.168.50.12"
Ports = {
  :koha_opac =>  { :port => REDEF["koha"]["port_opac"], :path =>'/' },
  :koha_intra => { :port => REDEF["koha"]["port_intra"], :path =>'/' },
  :services => { :port => REDEF["services"]["port"], :path =>'/application.wadl?detail=true' },
  :patron_client_search => { :port => REDEF["patron-client"]["port"], :path =>'/search' },
  :patron_client_person => { :port => REDEF["patron-client"]["port"], :path =>'/person/dummyid' },
  :patron_client_work => { :port => REDEF["patron-client"]["port"], :path =>'/work/dummyid' },
  :catalinker => { :port => REDEF["catalinker"]["port"], :path =>'/' },
  :elasticsearch => { :port => REDEF["elasticsearch"]["http"]["port"], :path =>'/' }
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
