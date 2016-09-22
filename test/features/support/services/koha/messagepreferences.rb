# encoding: UTF-8

require 'net/http'
require 'uri'
require 'json'
require_relative '../service.rb'

module KohaRESTAPI

  class MessagePreferences < Service

    def get(borrowernumber)
      headers = {
	      'Cookie' => @context[:koha_rest_api_cookie],
	      'Content-Type' => 'application/json'
	    }
	    http = Net::HTTP.new("xkoha", 8081)
	    uri = URI("#{intranet(:koha_rest_api)}messagepreferences/#{borrowernumber}")
	    res = http.get(uri, headers)
	    expect(res.code).to eq("200"), "got unexpected #{res.code} when listing borrower message preferences.\nResponse body: #{res.body}"
	    res.body
    end

    # BODY params: item_due, advance_notice, hold_filled, item_check_in, item_check_out
    #{
    #  item_due: {
    #    transports: ["sms", "email"],
    #    days_in_advance: 5
    #    wants_digest: true
    #  },
    #  ...
    #}
    def update(borrowernumber, params)
      headers = {
        'Cookie' => @context[:koha_rest_api_cookie],
        'Content-Type' => 'application/json'
      }
      http = Net::HTTP.new("xkoha", 8081)
      uri = URI("#{intranet(:koha_rest_api)}messagepreferences/#{borrowernumber}")
      res = http.put(uri, params.to_json, headers)
      expect(res.code).to eq("200"), "got unexpected #{res.code} when updating borrower message preferences.\nResponse body: #{res.body}"
      res.body
    end

  end
end
