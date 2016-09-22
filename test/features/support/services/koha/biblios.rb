# encoding: UTF-8

require 'net/http'
require 'uri'
require 'json'
require_relative '../service.rb'

module KohaRESTAPI

  class Biblios < Service

    def get(biblionumber)
      headers = {
        'Cookie' => @context[:koha_rest_api_cookie],
        'Content-Type' => 'application/json'
      }
      http = Net::HTTP.new("xkoha", 8081)
      uri = URI("#{intranet(:koha_rest_api)}biblios/#{biblionumber}")
      res = http.get(uri, headers)
      expect(res.code).to eq("200"), "got unexpected #{res.code} when fetching biblio.\nResponse body: #{res.body}"
      res.body
    end

    def add(marcxml)
      headers = {
        'Cookie' => @context[:koha_rest_api_cookie],
        'Content-Type' => 'text/xml'
      }

      http = Net::HTTP.new("xkoha", 8081)
      uri = URI(intranet(:koha_rest_api) + "biblios")
      res = http.post(uri, marcxml, headers)
      expect(res.code).to eq("201"), "got unexpected #{res.code} when adding biblio.\nResponse body: #{res.body}"
      res
    end

    def update(marcxml)
      return "Not implemented"
    end

    # Delete biblio will also delete all attached items unless they have status reserved or issued
    def delete(biblionumber)
      headers = {
        'Cookie' => @context[:koha_rest_api_cookie],
        'Content-Type' => 'application/json'
      }
      http = Net::HTTP.new("xkoha", 8081)
      uri = URI("#{intranet(:koha_rest_api)}biblios/#{biblionumber}")
      res = http.delete(uri, headers)
      expect(res.code).to eq("200"), "got unexpected #{res.code} when deleting biblio.\nResponse body: #{res.body}"
      res
    end
  end
end
