# encoding: UTF-8

require 'net/http'
require 'uri'
require 'json'
require_relative '../service.rb'
require_relative '../../context_structs.rb'

module SVC
  class Biblio < Service

    def add
      http = Net::HTTP.new(host, 8081)
      res = http.get("/cgi-bin/koha/svc/authentication?userid=#{PILLAR['koha']['adminuser']}&password=#{PILLAR['koha']['adminpass']}")
      res.body.should_not include("failed")
      @context[:svc_cookie] = res.response['set-cookie']

      # Book item needs branch and itemtype before import
      book = Book.new
      book.addItem
      book.items.first.branch   = @active[:branch]
      book.items.first.itemtype = @active[:itemtype]

      data = File.read("features/upload-files/Fargelegg byen!.marc21", :encoding => 'UTF-8')
      data = data.gsub(/\{\{ book_title \}\}/, book.title)
      data = data.gsub(/\{\{ branchcode \}\}/, @active[:branch].code)
      data = data.gsub(/\{\{ item_type_code \}\}/, @active[:itemtype].code)
      data = data.gsub(/\{\{ item_barcode \}\}/, book.items.first.barcode)
      headers = {
        'Cookie' => @context[:svc_cookie],
        'Content-Type' => 'text/xml'
      }
      # NB! param items=1 means imports items from $952
      # Branch codes in $952a/b MUST exist as Libraries in Koha for items,
      # barcode, etc to be imported!
      res = http.post("/cgi-bin/koha/svc/new_bib?items=1", data, headers)
      res.body.should include("<status>ok</status>")
      book.biblionumber = res.body.match(/<biblionumber>(\d+)<\/biblionumber>/)[1]

      # force rebuild and restart zebra bibliographic index
      `ssh 192.168.50.12 -o UserKnownHostsFile=/dev/null -o StrictHostKeyChecking=no 'sudo docker exec koha_container sudo koha-rebuild-zebra -v -f -b #{PILLAR['koha']['instance']}' >&2`
      STDERR.puts "koha-rebuild-zebra has returned"

      return book
    end

    def delete(book)
      @browser.goto intranet(:biblio_detail)+book.biblionumber

      #delete book items
      @browser.execute_script("window.confirm = function(msg){return true;}")
      @browser.button(:text => "Edit").click
      @browser.a(:id => "deleteallitems").click

      #delete book record
      @browser.execute_script("window.confirm = function(msg){return true;}")
      @browser.button(:text => "Edit").click
      @browser.a(:id => "deletebiblio").click
    end

  end
end
