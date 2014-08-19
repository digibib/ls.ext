# encoding: utf-8

require 'net/http'
require 'uri'

When(/^jeg forsøker å nå koha over http$/) do
  uri = URI.parse(intranet)
  @last_response = Net::HTTP.get_response(uri) #default is :follow_redirect => false
end

Then(/^vil jeg få http ok tilbake$/) do
  @last_response.kind_of?(Net::HTTPOK).should == true
end
