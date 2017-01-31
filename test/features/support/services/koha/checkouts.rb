# encoding: UTF-8

require 'net/http'
require 'uri'
require 'json'
require_relative '../service.rb'

module KohaRESTAPI

  class Checkouts < Service

    def get(checkout_id)
      return "Not implemented"
    end

    def list(borrowernumber)
      cookie = @context[:koha_rest_api_cookie] ?
        @context[:koha_rest_api_cookie] :
        @context[:koha].headers["Cookie"]

      headers = {
        'Cookie' => cookie,
        'Content-Type' => 'application/json'
      }

      http = Net::HTTP.new("xkoha", 8081)
      uri = URI(intranet(:koha_rest_api) + "checkouts?borrowernumber=#{borrowernumber.to_i}")
      res = http.get(uri, headers)
      expect(res.code).to eq("200"), "got unexpected #{res.code} when listing checkouts.\nResponse body: #{res.body}"
      res.body
    end

    def renew(checkout_id)
      return "Not implemented"
    end

  end
end
