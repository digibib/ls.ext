# encoding: UTF-8

require 'net/http'
require 'uri'
require 'json'
require_relative '../service.rb'

module KohaRESTAPI

  class Messaging < Service

    def send_account_details(borrowernumber)
      headers = {
	      'Cookie' => @context[:koha_rest_api_cookie]
	    }
	    http = Net::HTTP.new("xkoha", 8081)
	    uri = URI("#{intranet(:koha_rest_api)}messaging/patrons/#{borrowernumber}/accountdetails")
	    res = http.put(uri, {}.to_json, headers)
	    expect(res.code).to eq("200"), "got unexpected #{res.code} when sending patron account details.\nResponse body: #{res.body}"
	    res.body
    end
  end
end
