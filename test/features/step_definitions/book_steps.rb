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
  @context[:book_title] = generateRandomString  
  @context[:svc_cookie] = res.response['set-cookie']
  @context[:item_barcode] = '0301%010d' % rand(10 ** 10)
  data = File.read("features/upload-files/Fargelegg byen!.normarc", :encoding => 'UTF-8')
  data = data.gsub(/\{\{ book_title \}\}/, @context[:book_title])
  data = data.gsub(/\{\{ branchcode \}\}/, @context[:branchcode])
  data = data.gsub(/\{\{ item_type_code \}\}/, @context[:item_type_code])
  data = data.gsub(/\{\{ item_barcode \}\}/, @context[:item_barcode])
  headers = {
    'Cookie' => @context[:svc_cookie],
    'Content-Type' => 'text/xml'
  }
  # NB! param items=1 means imports items from $952
  # Branch codes in $952a/b MUST exist as Libraries in Koha for items,
  # barcode, etc to be imported!
  res = @http.post("/cgi-bin/koha/svc/new_bib?items=1", data, headers)
  res.body.should include("<status>ok</status>")
  @context[:book_id] = res.body.match(/<biblionumber>(\d+)<\/biblionumber>/)[1]
  barcode_search = res.body.match(/code=\"p\">(\d+)<\/subfield>/)
  STDOUT.puts "DEBUG PRINT res.body: #{res.body}" if !barcode_search || barcode_search.length < 2
  @context[:barcode] = barcode_search[1]
  # force rebuild and restart zebra bibliographic index
  `ssh -i ~/.ssh/insecure_private_key vagrant@192.168.50.12 -o UserKnownHostsFile=/dev/null -o StrictHostKeyChecking=no 'sudo docker exec koha_container sudo koha-rebuild-zebra -f #{SETTINGS['koha']['instance']}' > /dev/null 2>&1`
    # stop zebra
  `ssh -i ~/.ssh/insecure_private_key vagrant@192.168.50.12 -o UserKnownHostsFile=/dev/null -o StrictHostKeyChecking=no 'sudo docker exec koha_container sudo koha-stop-zebra #{SETTINGS['koha']['instance']}' > /dev/null 2>&1`
    # start zebra
  `ssh -i ~/.ssh/insecure_private_key vagrant@192.168.50.12 -o UserKnownHostsFile=/dev/null -o StrictHostKeyChecking=no 'sudo docker exec koha_container sudo koha-start-zebra #{SETTINGS['koha']['instance']}' > /dev/null 2>&1`

  @cleanup.push( "bok #{@context[:book_id]}" =>
    lambda do
      @browser.goto intranet(:bib_record)+@context[:book_id]

      #delete book items
      @browser.execute_script("window.confirm = function(msg){return true;}")
      @browser.button(:text => "Edit").click
      @browser.a(:id => "deleteallitems").click

      #delete book record
      @browser.execute_script("window.confirm = function(msg){return true;}")
      @browser.button(:text => "Edit").click
      @browser.a(:id => "deletebiblio").click
    end
  )
end

When(/^jeg legger til en materialtype$/) do
  @browser.goto intranet(:item_types)
  @browser.a(:id => "newitemtype").click
  form = @browser.form(:id => "itemtypeentry")
  @context[:item_type_code] = generateRandomString.upcase
  @context[:item_type_desc] = generateRandomString
  form.text_field(:id => "itemtype").set @context[:item_type_code]
  form.text_field(:id => "description").set @context[:item_type_desc]
  form.submit

  @cleanup.push( "materialtype #{@context[:item_type_code]}" =>
    lambda do
      @browser.goto intranet(:item_types)
      table = @browser.table(:id => "table_item_type")
      table.wait_until_present
      table.rows.each do |row|
        if row.text.include?(@context[:item_type_code])
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
  table.text.should include(@context[:item_type_code])
  table.text.should include(@context[:item_type_desc])
end

Then(/^viser systemet at boka er en bok som( ikke)? kan lånes ut$/) do |boolean|
  @browser.goto "http://#{host}:8081/cgi-bin/koha/catalogue/detail.pl?biblionumber=#{@context[:book_id]}"
  @browser.div(:id => "catalogue_detail_biblio").text.should include(@context[:book_title])
  holdings = @browser.div(:id => "holdings")
  barcode = holdings.tbody.tr.td(:index => 7).text
  status = @browser.td(:text => @context[:barcode])
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
  form.text_field(:id => "search-form").set(@context[:book_title]) 
  form.submit
  @browser.text.should include(@context[:book_title])
  @browser.text.should include("vailable")
end
