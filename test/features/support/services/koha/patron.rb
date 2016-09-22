# encoding: UTF-8

require 'net/http'
require 'uri'
require 'json'
require_relative '../service.rb'

module KohaRESTAPI

  class Patron < Service

    # valid params: userid, cardnumber, surname
    def list(params)
      headers = {
        'Cookie' => @context[:koha_rest_api_cookie],
        'Content-Type' => 'application/json'
      }

      filters = params.select { |k, | [:userid, :cardnumber, :surname, :firstname].include? k }
      http = Net::HTTP.new("xkoha", 8081)
      uri = URI(intranet(:koha_rest_api) + "patrons?" + URI.encode_www_form(params))
      res = http.get(uri, headers)
      expect(res.code).to eq("200"), "got unexpected #{res.code} when listing patrons.\nResponse body: #{res.body}"
      res.body
    end

    def get(borrowernumber)
      return "Not implemented"
    end

    def exists?(params)
      res = JSON.parse(list(params))
      return res.length >= 1
    end

    # params in JSON BODY: branchcode, categorycode, cardnumber, userid, passsword, etc.
    def add(params)
      headers = {
        'Cookie' => @context[:koha_rest_api_cookie],
        'Content-Type' => 'application/json'
      }

      http = Net::HTTP.new("xkoha", 8081)
      uri = URI(intranet(:koha_rest_api) + "patrons")
      res = http.post(uri, params.to_json, headers)
      expect(res.code).to eq("201"), "got unexpected #{res.code} when adding patron.\nResponse body: #{res.body}"
      res.body
    end

    # params in JSON BODY: branchcode, categorycode, cardnumber, userid, passsword, etc.
    def update(borrowernumber, params)
      #raise ArgumentError, "need both priority and branchcode params!" unless params[:priority] && params[:branchcode]
      headers = {
        'Cookie' => @context[:koha_rest_api_cookie],
        'Content-Type' => 'application/json'
      }
      http = Net::HTTP.new("xkoha", 8081)
      uri = URI("#{intranet(:koha_rest_api)}patrons/#{borrowernumber}")
      res = http.put(uri, params.to_json, headers)
      expect(res.code).to eq("200"), "got unexpected #{res.code} when updating patron.\nResponse body: #{res.body}"
      res.body
    end

    def delete(borrowernumber)
      headers = {
        'Cookie' => @context[:koha_rest_api_cookie],
        'Content-Type' => 'application/json'
      }
      http = Net::HTTP.new("xkoha", 8081)
      uri = URI("#{intranet(:koha_rest_api)}patrons/#{borrowernumber}")
      res = http.delete(uri, headers)
      expect(res.code).to eq("200"), "got unexpected #{res.code} when deleting patron.\nResponse body: #{res.body}"
      res
    end

  end
end
