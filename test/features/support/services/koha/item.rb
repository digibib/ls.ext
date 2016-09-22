# encoding: UTF-8

require 'net/http'
require 'uri'
require 'json'
require_relative '../service.rb'

module KohaRESTAPI

  class Items < Service

    def get(itemnumber)
      return "Not implemented"
    end

    def get_extended_biblio(itemnumber)
      http = Net::HTTP.new("xkoha", 8081)
      uri = URI(intranet(:koha_rest_api) + "items/#{itemnumber}/biblio")
      res = http.get(uri)
      expect(res.code).to eq("200"), "got unexpected #{res.code} when listing extended item with biblio.\nResponse body: #{res.body}"
      res.body
    end

  end
end
