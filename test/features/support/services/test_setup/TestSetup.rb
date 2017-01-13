require "net/http"
require "uri"
require "json"
require "date"
require_relative "../sip/SIP2Client.rb"
require "pry"
require 'bcrypt'

module TestSetup

  class Koha
    attr_accessor :api, :basedir, :apiuser, :apipass, :sipuser, :sippass, :http, :headers, :patrons, :biblio, :holds

    def initialize(host="localhost",apiuser="api",apipass="secret",sipuser="autohb",sippass="autopass",dbversion="16.1101000",basedir="./features/support/services/test_setup")
      @api = URI.parse("http://#{host}:8081/api/v1/")
      @basedir = basedir
      @apiuser = apiuser
      @apipass = apipass
      @sipuser = sipuser
      @sippass = sippass
      setup_db(dbversion)
      uri = @api + "auth/session"
      res = Net::HTTP.post_form(uri, {userid: apiuser, password: apipass})
      @headers = { "Cookie" => res.response["set-cookie"] }
      @patrons, @biblio, @holds = [],[],[]
      res.body
    end

    # make sure koha is populated with neccessary tables and api user and sip user in place
    def setup_db(dbversion)
      apipassenc = BCrypt::Password.create(@apipass, cost: 8)
      sippassenc = BCrypt::Password.create(@sippass, cost: 8)
      STDOUT.puts "Dumping koha db..."
      `docker run --rm -v dockercompose_koha_mysql_data:/from alpine ash -c "cd /from ; tar -cf - ." > kohadb.tar`

      STDOUT.puts "Pre-populating koha db..."
      mysqlcmd = "mysql --local-infile=1 --default-character-set=utf8 --init-command=\"SET SESSION FOREIGN_KEY_CHECKS=0;\" -h koha_mysql -u\$MYSQL_USER -p\$MYSQL_PASSWORD koha_name"
      `sed -e "s/__KOHA_DBVERSION__/#{dbversion}/" #{@basedir}/deich_koha_base.sql | sudo docker exec -i koha_mysql bash -c '#{mysqlcmd}'`
      `awk -v apipass='#{apipassenc}' -v sippass='#{sippassenc}' '{gsub(/__API_PASS__/, apipass); gsub(/__SIP_PASS__/, sippass)};1' #{@basedir}/users.sql | sudo docker exec -i koha_mysql bash -c '#{mysqlcmd}'`
      `docker exec -i xkoha bash -c "supervisorctl -u#{@apiuser} -p#{@apipass} restart plack"`
    end

    def self.restore_db
      `docker stop koha_mysql`
      `cat kohadb.tar | docker run -i --rm -v dockercompose_koha_mysql_data:/to alpine ash -c "cd /to ; tar -xf -"`
      `docker start koha_mysql`
    end

    def populate(args = {patrons: 1, items: 1, holds: 1})
      self.add_patrons(args[:patrons])
      self.add_biblio(args[:items])
      self.add_hold(args[:holds])
      self
    end

    def cleanup
      # order is important
      self.delete_holds
      self.delete_biblio
      self.delete_patrons
      self
    end

    # params in JSON BODY: branchcode, categorycode, cardnumber, userid, passsword, etc.
    def add_patrons(numberOfPatrons=1)
      @headers["Content-Type"] = "application/json"

      numberOfPatrons.to_i.times do
        id = random_number(10)
        params = {
          categorycode: "V",
          branchcode: "hutl",
          cardnumber: id,
          userid:  id,
          surname: random_string(8),
          dateenrolled: Date.today.to_s,
          dateexpiry: (Date.today+3).to_s,
          password: "1234"
        }
        http = Net::HTTP.new(@api.host, @api.port)
        req = Net::HTTP::Post.new(@api.request_uri + "patrons", @headers)
        req.body = params.to_json
        res = http.request(req)
        patron = JSON.parse(res.body)
        @patrons << patron
      end
      @patrons
    end

    def delete_patrons
      @patrons.each do |patron|
        http = Net::HTTP.new(@api.host, @api.port)
        uri = URI(@api + "patrons/" + patron["borrowernumber"].to_s)
        res = http.delete(uri, @headers)
      end
    end

    def add_biblio(numberOfItems=1)
      @headers["Content-Type"] = "text/xml"
      biblioxml = File.read("#{@basedir}/bibrecord.xml", :encoding => "UTF-8")
      itemxml = File.read("#{@basedir}/item.xml", :encoding => "UTF-8")
      
      itemsxml = ''
      numberOfItems.to_i.times do
        item = itemxml.gsub("__BARCODE__", random_number(14))
        item.gsub!("__BRANCHCODE__", "hutl")
        item.gsub!("__BRANCHCODE__", "hutl")
        itemsxml << item
      end

      biblioxml.gsub!("__ITEMS__", itemsxml)

      http = Net::HTTP.new(@api.host, @api.port)
      uri = URI(@api + "biblios")
      res, data = http.post(uri, biblioxml, @headers)
      @biblio = JSON.parse(res.body)
      # need to get full biblio with items after import
      @headers["Content-Type"] = "application/json"
      res, data = http.get("#{uri}/#{@biblio["biblionumber"]}/expanded" , @headers)
      @biblio = JSON.parse(res.body)
    end

    def delete_biblio
      return unless @biblio["items"]
      @biblio["items"].each do |item|
        http = Net::HTTP.new(@api.host, @api.port)
        uri = URI(@api + "biblios/" + item["itemnumber"].to_s)
        res = http.delete(uri, @headers)
        STDOUT.puts res.header
      end
    end

    # JSON params: borrowernumber, biblionumber, itemnumber, branchcode, expirationdate
    def add_hold(numberOfHolds=1)
      numberOfHolds.to_i.times do
        @headers["Content-Type"] = "application/json"
        params = {
          borrowernumber: @patrons[0]["borrowernumber"].to_i,
          biblionumber: @biblio["biblio"]["biblionumber"].to_i,
          branchcode: "hutl"
        }

        http = Net::HTTP.new(@api.host, @api.port)
        uri = URI(@api + "holds")
        res, data = http.post(uri, params.to_json, @headers)

        @holds << JSON.parse(res.body)
      end
    end

    def get_hold(id)
      @headers["Content-Type"] = "application/json"
      http = Net::HTTP.new(@api.host, @api.port)
      uri = URI(@api + "holds")
      # /api/v1/holds still has no REST for GETting one hold by id 
      res, data = http.get("#{uri}/?reserve_id=#{id}", @headers)

      JSON.parse(res.body)
    end

    def delete_holds
      @holds.each do |hold|
        http = Net::HTTP.new(@api.host, @api.port)
        uri = URI(@api + "holds/" + hold["reserve_id"].to_s)
        res = http.delete(uri, @headers)
      end
    end

    def random_string(length)
      rand(36**length).to_s(36)
    end

    def random_number(length)
      rand.to_s[2.."#{length}".to_i]
    end
  end

  class Circulation
    attr_accessor :client, :checkin, :checkout

    # Uses SIP proxy client
    def initialize(host="localhost",port="6002",user="autohb",pass="autopass")
      @client = SIP2Client.new(host, port)
      @client.connect("#{user}", "#{pass}")
    end

    def checkout(branch,cardnumber,pin,barcode)
      @checkout = @client.checkout(branch,cardnumber,pin,barcode)
    end

    def checkin(branch,barcode)
      @checkin = @client.checkin(branch,barcode)
    end
  end

  class Services
    # TODO
    attr_accessor :api, :http, :headers

    def initialize(host="localhost", port="8005")
      @api = URI.parse("http://#{host}:#{port}//")
    end

  end
end

