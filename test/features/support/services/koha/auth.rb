# encoding: UTF-8

require 'net/http'
require 'uri'
require 'json'
require_relative '../service.rb'

module KohaRESTAPI

  class Auth < Service
    def login(user,pass)
      http = Net::HTTP.new(host, 8081)
      # For now we use SVC auth, since REST API Auth is not supported yet
      res = http.get(intranet(:svc_auth) + "userid=#{user}&password=#{pass}")
      expect(res.code).to eq("200"), "got unexpected #{res.code} when authenticating to Koha API"
      @context[:koha_rest_api_cookie] = res.response['set-cookie']
    end

    def logout
    end
  end

end
