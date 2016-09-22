# encoding: UTF-8

require 'net/http'
require 'uri'
require 'json'
require_relative '../service.rb'

module KohaRESTAPI

  class Hold < Service

    def get(borrowernumber)
      return "Not implemented"
    end

    # JSON params: borrowernumber, biblionumber, itemnumber, branchcode, expirationdate
    def add(params)
      headers = {
        'Cookie' => @context[:koha_rest_api_cookie],
        'Content-Type' => 'application/json'
      }

      http = Net::HTTP.new("xkoha", 8081)
      uri = URI(intranet(:koha_rest_api) + "holds")
      res = http.post(uri, params.to_json, headers)
      expect(res.code).to eq("201"), "got unexpected #{res.code} when adding hold.\nResponse body: #{res.body}"
      res.body
    end

    # JSON params: reserve_id, priority, branchcode, suspend_until
    def update(params)
      # TODO: API expects both priority and branchcode to update branch, bug in Koha module C4::Reserves::ModReserve
      raise ArgumentError, "need both priority and branchcode params!" unless params[:priority] && params[:branchcode]
      headers = {
        'Cookie' => @context[:koha_rest_api_cookie],
        'Content-Type' => 'application/json'
      }
      http = Net::HTTP.new("xkoha", 8081)
      uri = URI("#{intranet(:koha_rest_api)}holds/#{params[:reserve_id]}")
      res = http.put(uri, params.to_json, headers)
      expect(res.code).to eq("200"), "got unexpected #{res.code} when updating reserve.\nResponse body: #{res.body}"
      res.body
    end

    def delete(reserve_id)
      headers = {
        'Cookie' => @context[:koha_rest_api_cookie],
        'Content-Type' => 'application/json'
      }
      http = Net::HTTP.new("xkoha", 8081)
      uri = URI("#{intranet(:koha_rest_api)}holds/#{reserve_id}")
      res = http.delete(uri, headers)
      expect(res.code).to eq("200"), "got unexpected #{res.code} when deleting reserve.\nResponse body: #{res.body}"
      res
    end

  end
end
