# encoding: UTF-8

require 'net/http'
require 'uri'
require 'json'
require_relative '../service.rb'

module KohaRESTAPI

  class Auth < Service

    def login(userid,password)
      http = Net::HTTP.new(host, 8081)
      uri = URI(intranet(:koha_rest_api) + "auth/session")
      res = http.post(uri, {userid: userid, password: password}.to_json)
      expect(res.code).to eq("201"), "got unexpected #{res.code} when authenticating against Koha REST API.\nResponse body: #{res.body}"
      @context[:koha_rest_api_cookie] = res.response['set-cookie']
    end

    def logout
      headers = {
        'Cookie' => @context[:koha_rest_api_cookie]
      }
      http = Net::HTTP.new(host, 8081)
      uri = URI(intranet(:koha_rest_api) + "auth/session")
      res = http.delete(uri, headers)
      expect(res.code).to eq("200"), "got unexpected #{res.code} when logging out via Koha REST API.\nResponse body: #{res.body}"
      res
    end

    def getsession
      headers = {
        'Cookie' => @context[:koha_rest_api_cookie],
        'Content-Type' => 'application/json'
      }
      http = Net::HTTP.new(host, 8081)
      uri = URI(intranet(:koha_rest_api) + "auth/session")
      res = http.get(uri, headers)
      expect(res.code).to eq("200"), "got unexpected #{res.code} when fetching user session.\nResponse body: #{res.body}"
      res
    end
  end

end
