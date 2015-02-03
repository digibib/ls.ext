# encoding: UTF-8

require 'net/http'
require 'uri'
require 'json'
require_relative '../service.rb'

module SVC
  class Preference < Service

    def get(pref)
    end

    def set(pref, value)
      session_cookie = "CGISESSID=#{@browser.cookies["CGISESSID"][:value]}"
      headers = {
       "Cookie" => session_cookie,
       "Accept" => "application/json, text/javascript, */*; q=0.01",
       "Content-Type" => "application/x-www-form-urlencoded; charset=UTF-8"
      }
      # The preferences API is not well documented yet
      params = {
        pref => value
      }

      uri = URI.parse intranet(:preferences)
      http = Net::HTTP.new(uri.host, uri.port)
      req = Net::HTTP::Post.new(uri.request_uri, headers)
      req.set_form_data(params)
      res = http.request(req)
      json = JSON.parse(res.body)
      unless res.kind_of? Net::HTTPSuccess
        raise Exception.new("Error setting systempreference: #{pref}, #{value}\nResponse code: #{res.code}\nResponse: #{res.body}")
      end
      return json
    end
  end
end