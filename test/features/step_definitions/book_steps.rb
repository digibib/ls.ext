# encoding: UTF-8

Given(/^at det finnes en materialtype$/) do
  @browser.goto intranet(:item_types)
  step "jeg legger til en materialtype"
end

Given(/^at boka finnes i biblioteket$/) do
  steps %Q{
    Gitt at det finnes en avdeling
    Når jeg legger til en materialtype
    Og jeg legger inn boka som en ny bok
  }
end

When(/^jeg legger inn boka som en ny bok$/) do
  @http = Net::HTTP.new(host, 8081)
  res = @http.get("/cgi-bin/koha/svc/authentication?userid=#{SETTINGS['koha']['adminuser']}&password=#{SETTINGS['koha']['adminpass']}")
  res.body.should_not include("failed")
  @context[:svc_cookie] = res.response['set-cookie']

  @book = Book.new
  # Book needs branch and itemtype before import
  @book.addItem
  @book.items.first.branch   = @branch
  @book.items.first.itemtype = @itemtype
  data = File.read("features/upload-files/Fargelegg byen!.normarc", :encoding => 'UTF-8')
  data = data.gsub(/\{\{ book_title \}\}/, @book.title)
  data = data.gsub(/\{\{ branchcode \}\}/, @branch.code)
  data = data.gsub(/\{\{ item_type_code \}\}/, @itemtype.code)
  data = data.gsub(/\{\{ item_barcode \}\}/, @book.items.first.barcode)
  headers = {
    'Cookie' => @context[:svc_cookie],
    'Content-Type' => 'text/xml'
  }
  # NB! param items=1 means imports items from $952
  # Branch codes in $952a/b MUST exist as Libraries in Koha for items,
  # barcode, etc to be imported!
  res = @http.post("/cgi-bin/koha/svc/new_bib?items=1", data, headers)
  res.body.should include("<status>ok</status>")
  @book.biblionumber = res.body.match(/<biblionumber>(\d+)<\/biblionumber>/)[1]
  #barcode_search = res.body.match(/code=\"p\">(\d+)<\/subfield>/)
  #STDOUT.puts "DEBUG PRINT res.body: #{res.body}" if !barcode_search || barcode_search.length < 2
  #@book.items.first.barcode = barcode_search[1]
  # force rebuild and restart zebra bibliographic index
  `ssh -i ~/.ssh/insecure_private_key vagrant@192.168.50.12 -o UserKnownHostsFile=/dev/null -o StrictHostKeyChecking=no 'sudo docker exec koha_container sudo koha-rebuild-zebra -f #{SETTINGS['koha']['instance']}' > /dev/null 2>&1`
    # stop zebra
  `ssh -i ~/.ssh/insecure_private_key vagrant@192.168.50.12 -o UserKnownHostsFile=/dev/null -o StrictHostKeyChecking=no 'sudo docker exec koha_container sudo koha-stop-zebra #{SETTINGS['koha']['instance']}' > /dev/null 2>&1`
    # start zebra
  `ssh -i ~/.ssh/insecure_private_key vagrant@192.168.50.12 -o UserKnownHostsFile=/dev/null -o StrictHostKeyChecking=no 'sudo docker exec koha_container sudo koha-start-zebra #{SETTINGS['koha']['instance']}' > /dev/null 2>&1`

  @context[:book] = @book

  @cleanup.push( "bok #{@book.biblionumber}" =>
    lambda do
      @browser.goto intranet(:bib_record)+@book.biblionumber

      #delete book items
      @browser.execute_script("window.confirm = function(msg){return true;}")
      @browser.button(:text => "Edit").click
      @browser.a(:id => "deleteallitems").click

      #delete book record
      @browser.execute_script("window.confirm = function(msg){return true;}")
      @browser.button(:text => "Edit").click
      @browser.a(:id => "deletebiblio").click

      #delete item type
      #@browser.goto intranet(:item_types)
      #table = @browser.table(:id => "table_item_type")
      #table.wait_until_present
      #table.rows.each do |row|
      #  if row.text.include?(@itemtype.code)
      #    row.link(:href => /op=delete_confirm/).click
      #    @browser.input(:value => "Delete this Item Type").click
      #    break
      #  end
      #end

      #delete branch
      #@browser.goto intranet(:branches)
      #@browser.div(:id => "branchest_filter").text_field().set(@branch.name)
      #@browser.link(:href => "?branchcode=" + @branch.code + "&branchname=" + @branch.name + "&op=delete").click
      #form = @browser.form(:action => "/cgi-bin/koha/admin/branches.pl")
      #if form.text.include?(@branch.code)
      #  form.submit
      #end
    end
  )
end

When(/^jeg legger til en materialtype$/) do
  @browser.goto intranet(:item_types)
  @browser.a(:id => "newitemtype").click
  form = @browser.form(:id => "itemtypeentry")
  @itemtype = ItemType.new

  form.text_field(:id => "itemtype").set @itemtype.code
  form.text_field(:id => "description").set @itemtype.desc
  form.submit

  @cleanup.push( "materialtype #{@itemtype.code}" =>
    lambda do
      @browser.goto intranet(:item_types)
      table = @browser.table(:id => "table_item_type")
      table.wait_until_present
      table.rows.each do |row|
        if row.text.include?(@itemtype.code)
          row.link(:href => /op=delete_confirm/).click
          @browser.input(:value => "Delete this Item Type").click
          break
        end
      end
    end
  )
end

Then(/^kan jeg se materialtypen i listen over materialtyper$/) do
  @browser.goto intranet(:item_types)
  table = @browser.table(:id => "table_item_type")
  @browser.select_list(:name => "table_item_type_length").select_value("-1")
  table.wait_until_present
  table.text.should include(@itemtype.code)
  table.text.should include(@itemtype.desc)
end

Then(/^viser systemet at boka er en bok som( ikke)? kan lånes ut$/) do |boolean|
  @browser.goto "http://#{host}:8081/cgi-bin/koha/catalogue/detail.pl?biblionumber=#{@book.biblionumber}"
  @browser.div(:id => "catalogue_detail_biblio").text.should include(@book.title)
  holdings = @browser.div(:id => "holdings")
  barcode = holdings.tbody.tr.td(:index => 7).text
  status = @browser.td(:text => @book.items.first.barcode)
  status = status.parent.cell(:index => 5)
  if boolean
    status.text.should_not include("vailable")
  else
    status.text.should include("vailable")
  end
end

Then(/^kan jeg søke opp boka$/) do
  @browser.goto intranet(:home)
  @browser.a(:text => "Search the catalog").click
  form = @browser.form(:id => "cat-search-block")
  form.text_field(:id => "search-form").set(@book.title) 
  form.submit
  @browser.text.should include(@book.title)
  @browser.text.should include("vailable")
end