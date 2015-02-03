# encoding: UTF-8

require 'net/http'
require 'uri'
require 'json'
require_relative '../service.rb'

module SVC
  class User < Service

    def exists?(searchString)
      res = get(searchString)
      if res.any? {|user| user["dt_name"].include? searchString }
        return true
      else
        return false
      end
    end

    def get(user)
      session_cookie = "CGISESSID=#{@browser.cookies["CGISESSID"][:value]}"
      headers = {
       "Cookie" => session_cookie,
       "Accept" => "application/json",
       "Content-Type" => "application/x-www-form-urlencoded; charset=UTF-8"
      }
      # The search API is not well documented yet, but these params seems neccessary
      params = {
        "sEcho" => 2,
        "searchmember" => user,
        "searchfieldstype" => "standard",
        "searchtype" => "contain",
        "template_path" => "members/tables/members_results.tt"
      }

      uri = URI.parse intranet(:search_patrons)
      http = Net::HTTP.new(uri.host, uri.port)
      req = Net::HTTP::Post.new(uri.request_uri, headers)
      req.set_form_data(params)
      res = http.request(req)
      json = JSON.parse(res.body)
      return json["aaData"]
    end
  end
end