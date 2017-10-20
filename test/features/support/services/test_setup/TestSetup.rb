require "net/http"
require "uri"
require "json"
require "date"
require_relative "../sip/SIP2Client.rb"
require_relative '../resource_api/client.rb'
require_relative '../../context_structs.rb'
require "pry"
require 'bcrypt'

module TestSetup

  class Koha
    attr_accessor :dbversion, :api, :basedir, :apiuser, :apipass, :sipuser, :sippass, :http, :headers, :patrons, :biblio, :holds

    def initialize(host="localhost",apiuser="api",apipass="secret",sipuser="autohb",sippass="autopass",basedir="./features/support/services/test_setup")
      @api = URI.parse("http://#{host}:8081/api/v1/")
      @basedir = basedir
      @apiuser = apiuser
      @apipass = apipass
      @sipuser = sipuser
      @sippass = sippass
      uri = @api + "auth/session"
      res = Net::HTTP.post_form(uri, {userid: apiuser, password: apipass})
      @headers = { "Cookie" => res.response["set-cookie"] }
      @patrons, @biblio, @holds = [],[],[]
      res.body
    end

    # make sure koha is populated with neccessary tables and api user and sip user in place
    def setup_db(dbversion="17.0504000")
      apipassenc = BCrypt::Password.create(@apipass, cost: 8)
      sippassenc = BCrypt::Password.create(@sippass, cost: 8)
      @dbversion = dbversion
      STDOUT.puts "Pre-populating koha db..."
      mysqlcmd = "mysql --local-infile=1 --default-character-set=utf8 --init-command=\"SET SESSION FOREIGN_KEY_CHECKS=0;\" -h koha_mysql -u\$MYSQL_USER -p\$MYSQL_PASSWORD koha_name"
      `sed -e "s/__KOHA_DBVERSION__/#{dbversion}/" #{@basedir}/deich_koha_base.sql | sudo docker exec -i koha_mysql bash -c '#{mysqlcmd}' > /dev/null 2>&1`
      `awk -v apipass='#{apipassenc}' -v sippass='#{sippassenc}' '{gsub(/__API_PASS__/, apipass); gsub(/__SIP_PASS__/, sippass)};1' #{@basedir}/users.sql | sudo docker exec -i koha_mysql bash -c '#{mysqlcmd}' > /dev/null 2>&1`
      `docker exec -i xkoha bash -c "supervisorctl -uadmin -p#{@apipass} restart plack"`
    end

    def self.dump_db
      STDOUT.puts "Dumping koha db..."
      `docker run --rm -v dockercompose_koha_mysql_data:/from alpine ash -c "cd /from ; tar -cf - ." > kohadb.tar`
    end

    def self.restore_db
      STDOUT.puts "Restoring koha db..."
      `docker stop koha_mysql`
      `cat kohadb.tar | docker run -i --rm -v dockercompose_koha_mysql_data:/to alpine ash -c "cd /to ; tar -xf -"`
      `docker start koha_mysql`
    end

    def populate(args = {})
      self.add_patrons(args[:patrons]) if args[:patrons] > 0
      self.add_biblio(args[:items]) if args[:items] > 0
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

      numberOfPatrons.times do
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
        if (res.code.to_i < 200 || res.code.to_i > 399)
          STDOUT.puts("Attempting to create user gave status code: #{res.code}")
          raise
        end
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
      @patrons = []
    end

    def add_biblio(numberOfItems=1)
      @headers["Content-Type"] = "text/xml"
      biblioxml = File.read("#{@basedir}/bibrecord.xml", :encoding => "UTF-8")
      itemxml = File.read("#{@basedir}/item.xml", :encoding => "UTF-8")

      itemsxml = ''
      numberOfItems.times do
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
      return if @biblio.empty?
      @biblio["items"].each do |item|
        http = Net::HTTP.new(@api.host, @api.port)
        uri = URI(@api + "biblios/" + item["itemnumber"].to_s)
        res = http.delete(uri, @headers)
        STDOUT.puts res.header
      end
      @biblio = []
    end

    # JSON params: borrowernumber, biblionumber, itemnumber, branchcode, expirationdate
    def add_hold(args = {})
      return unless args[:numberOfHolds] && args[:numberOfHolds] > 0
      borrowernumber = args[:borrowernumber] ? args[:borrowernumber].to_i : @patrons[0]["borrowernumber"].to_i
      biblionumber   = args[:biblionumber]   ? args[:biblionumber].to_i   : @biblio["biblio"]["biblionumber"].to_i
      branchcode     = args[:branchcode]     ? args[:branchcode]          : "hutl"
      numberOfHolds  = args[:numberOfHolds]  ? args[:numberOfHolds]       : 0
      numberOfHolds.to_i.times do
        @headers["Content-Type"] = "application/json"
        params = {
          borrowernumber: borrowernumber,
          biblionumber: biblionumber,
          branchcode: branchcode
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
      @holds = []
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
    attr_accessor :api, :client, :ontology, :works, :publications, :persons

    def initialize(host="localhost", port="8005")
      @api = URI.parse("http://#{host}:#{port}//")
      @client = ServicesAPIClient.new()
      @ontology = client.get_ontology()
      @mediatypes = %w(Book DVD Blu-ray CD-ROM NintendoDSGame Other)
      @languages = %w(http://lexvo.org/id/iso639-3/eng http://lexvo.org/id/iso639-3/dan http://lexvo.org/id/iso639-3/nob)
      @audiences = %w(adult juvenile ages11To12 ages13To15)
      @roles = %w(author illustrator composer)
      @works, @publications, @persons = [],[],[]
    end

    def add_work_with_publications_and_contributors(numberOfPublications=1, numberOfContributors=1)
      w = Resource.new(@ontology, :work)
      w.uri = @client.create_resource(w.type, w.literals)
      w.gen_literals("Work")
      @client.patch_resource(w.uri,w.literals)
      @works.push(w)

      numberOfContributors.times do |i|
        if i == 0
          add_contributor(w, "author", true) # First contributor is author and MainEntry
        else
          add_contributor(w, @roles.sample)
        end
      end

      numberOfPublications.times do
        p = Resource.new(@ontology, :publication)
        p.uri = @client.create_resource(p.type, p.literals)
        p.gen_literals("Publication")
        p.literals << RDF::Statement.new( RDF::URI.new(p.uri), ONTOLOGY.publicationOf, RDF::URI.new(w.uri) )
        p.literals << RDF::Statement.new( RDF::URI.new(p.uri), ONTOLOGY.language, RDF::URI(@languages.sample) )
        p.literals << RDF::Statement.new( RDF::URI.new(p.uri), ONTOLOGY.audience, DEICH[@audiences.sample] )
        p.literals << RDF::Statement.new( RDF::URI.new(p.uri), ONTOLOGY.mediaType, DEICH[@mediatypes.sample] )
        @client.patch_resource(p.uri,p.literals)
        updatedPub = @client.get_resource(p.uri) # Fetch generated resource, including record Id in Koha
        p.literals = updatedPub
        @publications.push(p)
      end
      self
    end

    def add_person
      c = Resource.new(@ontology, :person)
      c.uri = @client.create_resource(c.type, c.literals)
      c.gen_literals("Person")
      @client.patch_resource(c.uri,c.literals)
      updatedPerson = @client.get_resource(c.uri)
      c.literals = updatedPerson
      @persons.push(c)
      c
    end

    def add_contributor(work, role, mainEntry=false)
      c = add_person
      bnode = RDF::Node.new
      graph = RDF::Graph.new
      graph << RDF::Statement.new( RDF::URI.new(work.uri), ONTOLOGY.contributor, bnode )
      graph << RDF::Statement.new( bnode, RDF.type, ONTOLOGY.Contribution )
      graph << RDF::Statement.new( bnode, RDF.type, ONTOLOGY.MainEntry ) if mainEntry
      graph << RDF::Statement.new( bnode, ONTOLOGY.agent, RDF::URI.new(c.uri) )
      graph << RDF::Statement.new( bnode, ONTOLOGY.role, ROLE[role] )
      @client.patch_resource(work.uri, graph.statements)
      updated = @client.get_resource(work.uri)
      work.literals = updated
      @works.map!{|el|el.uri == work.uri ? work : el} # replace work in instance array
    end

    def del_contributor(work, role)
      r = work.literals.statements.select {|s| s.object == ROLE[role] }
      bnode = r[0].subject
      c = work.literals.statements.select {|s| s.subject == bnode || s.object == bnode }
      @client.patch_resource(work.uri, c, op="del")
      updated = @client.get_resource(work.uri)
      work.literals = updated
      @works.map!{|el|el.uri == work.uri ? work : el} # replace work in instance array
    end

    def get_value(resource, prop)
      stmt = resource.literals.statements.select {|s| s.predicate == ONTOLOGY[prop] }
      stmt[0].object.value if stmt.length > 0
    end

    def set_value(resource, prop, newValue)
      oldStmt = resource.literals.statements.select {|s| s.predicate == ONTOLOGY[prop] }
      @client.patch_resource(resource.uri, oldStmt, op="del")
      graph = RDF::Graph.new
      graph << RDF::Statement.new(RDF::URI.new(resource.uri), ONTOLOGY[prop], RDF::Literal.new(newValue))
      @client.patch_resource(resource.uri, graph.statements)
      updated = @client.get_resource(resource.uri)
    end

    def get_contributor_value(contributor, prop)
      # NOT IMPLEMENTED
    end

    def add_item(numberOfItems=1)
      # NOT IMPLEMENTED
    end

    def cleanup
      @works.each do |w|
        @client.remove_resource(w.uri)
      end
      @works = []
      @publications.each do |p|
        @client.remove_resource(p.uri)
      end
      @publications = []
      @persons.each do |h|
        @client.remove_resource(h.uri)
      end
    end
  end
end
