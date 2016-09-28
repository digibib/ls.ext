# encoding: UTF-8

require 'json'
require 'uri'
require 'net/http'

require_relative '../service.rb'

module Messaging
  class EmailAPI < Service

    def initialize
    end

    def api
      "http://smtp:#{port(:email_api)}"
    end

    def status
      uri = URI("#{self.api}/status")
      res = Net::HTTP.get_response(uri)
      expect(res.code).to eq("200"), "got unexpected #{res.code} when testing email API"
    end

    def get_mail
      self.status
      uri = URI("#{self.api}/mail")
      res = Net::HTTP.get_response(uri)
      expect(res.code).to eq("200"), "got unexpected #{res.code} when fetching all mails"
      JSON.parse(res.body)
    end

    def get_inbox(address)
      self.status
      uri = URI("#{self.api}/inbox/#{address}")
      retry_http_request do
        res = Net::HTTP.get_response(uri)
        expect(res.code).to eq("200"), "got unexpected #{res.code} when fetching inbox"
        JSON.parse(res.body)
      end
    end

    def delete_inbox(address)
      self.status
      uri = URI("#{self.api}/inbox/#{address}")

      req = Net::HTTP::Delete.new(uri.path)
      res = Net::HTTP.new(uri.host, uri.port).request(req)
      expect(res.code).to eq("200"), "got unexpected #{res.code} when deleting inbox"
      res
    end
  end
end