# encoding: UTF-8

require 'net/http'
require 'uri'
require 'json'
require_relative '../service.rb'
require_relative '../../context_structs.rb'

module CSVImport
  class User < Service

    # Method to import user hash via CSV in admin
    # @branch and patroncategory need to exist beforehand
    def import(user)
      return nil unless user.is_a? Hash
      patron = Patron.new
      # merge csv user into Patron struct
      patron.members.each do |key|
        patron[key] = user[key] if user[key]
      end

      # overwrite with active branch and category
      patron.branch     = @active[:branch]
      patron.category   = @active[:patroncategory]

      user[:branchcode]   = @active[:branch].code
      user[:categorycode] = @active[:patroncategory].code
      user[:cardnumber]   = patron.cardnumber
      user[:surname]      = patron.surname
      user[:debarred]     = patron.debarred

      # To convert to CSV via Migration 
      importuser = { patron.cardnumber => user }

      uri = URI.parse intranet(:patron_import)

      # Generate multipart form
      form_boundary = generateRandomString
      data = []
      data << "--#{form_boundary}\r\n"
      data << "Content-Disposition: form-data; name=\"uploadborrowers\"; filename=\"patrons.csv\"\r\n"
      data << "Content-Type: text/csv\r\n"
      data << "\r\n"
      data << Migration.to_csv(importuser)
      data << "--#{form_boundary}\r\n"
      data << "Content-Disposition: form-data; name=\"matchpoint\"\r\n"
      data << "\r\n"
      data << "cardnumber\r\n"
      data << "--#{form_boundary}\r\n"
      data << "Content-Disposition: form-data; name=\"overwrite_cardnumber\"\r\n"
      data << "\r\n"
      data << "1\r\n"
      data << "--#{form_boundary}--\r\n"

      session_cookie = "CGISESSID=#{@browser.cookies["CGISESSID"][:value]}"
      headers = {
       "Cookie" => session_cookie,
       "Content-Type" => "multipart/form-data, boundary=#{form_boundary}"
      }
      http = Net::HTTP.new(uri.host, uri.port)
      req = Net::HTTP::Post.new(uri.request_uri, headers)
      req.body = data.join
      res = http.request(req)
      return patron
    end

  end
end