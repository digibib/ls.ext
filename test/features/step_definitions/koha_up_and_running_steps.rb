# encoding: utf-8

require 'net/http'
require 'uri'


Når(/^jeg forsøker å nå koha over http$/) do
  uri = URI.parse("http://192.168.50.10:8081")
  @last_response = Net::HTTP.get_response(uri) #default is :follow_redirect => false
end

Så(/^vil jeg få http ok tilbake$/) do
  @last_response.kind_of?(Net::HTTPOK).should == true
end
