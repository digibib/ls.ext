# encoding: UTF-8

require 'net/http'
require 'uri'
require 'json'
require_relative '../service.rb'

module KohaRESTAPI

  class Reserve < Service

    def get(borrowernumber)
      return "Not implemented"
    end

    # JSON params: borrowernumber, biblionumber, itemnumber, branchcode, expirationdate
    def add(params)
      headers = {
        'Cookie' => @context[:koha_rest_api_cookie],
        'Content-Type' => 'application/json'
      }

      http = Net::HTTP.new(host, 8081)
      uri = URI(intranet(:koha_rest_api) + "reserves")
      #req = Net::HTTP::Post.new(uri, initheader = {'Cookie' => @context[:svc_cookie], 'Content-Type' =>'application/json'})
      #req.body = {branchcode: branchcode, borrowernumber: borrowernumber}.to_json
      #res = Net::HTTP.start(uri.hostname, uri.port) do |http|
      #  http.request(req)
      #end
      res = http.post(uri, params.to_json, headers)
      expect(res.code).to eq("200"), "got unexpected #{res.code} when adding reserve.\nResponse body: #{res.body}"
      @context[:reserve] = JSON.parse(res.response)
    end

    def update(params)
      return "Not implemented"
    end

    def delete(reserve_id)
      headers = {
        'Cookie' => @context[:koha_rest_api_cookie],
        'Content-Type' => 'application/json'
      }
      http = Net::HTTP.new(host, 8081)
      uri = URI("#{intranet(:koha_rest_api)}reserves/#{reserve_id}")
      res = http.delete(uri, {}, headers)
      expect(res.code).to eq("200"), "got unexpected #{res.code} when deleting reserve.\nResponse body: #{res.body}"
      @context[:reserve] = nil
    end

  end
end
