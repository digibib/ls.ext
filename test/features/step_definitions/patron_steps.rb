# encoding: UTF-8
require 'csv'
require 'net/http'
require 'uri'
require_relative '../support/migration.rb'
 
Given(/^at en låner ikke finnes som låner hos biblioteket fra før$/) do
  steps %Q{
    Gitt at det finnes en lånerkategori
    Og at det finnes en avdeling
  }
end

Given(/^at det finnes en lånerkategori$/) do
  steps %Q{
    Når jeg legger til en lånerkategori som heter "Voksen"
  }
end

Given(/^at "(.*?)" eksisterer som en låner$/) do |name|
  steps %Q{
    Gitt at det finnes en lånerkategori
    Når jeg legger inn \"#{name}\" som ny låner
    Så viser systemet at \"#{name}\" er låner
  }
end

Given(/^at det finnes data som beskriver en låner$/) do
  @csv = File.join(File.dirname(__FILE__), '..', 'upload-files', 'patrons.csv')
end

Given(/^at det finnes en mapping for konvertering$/) do
  @map = File.join(File.dirname(__FILE__), '..', 'upload-files', 'mapping_patrons.csv')
end

Given(/^at det finnes konverterte lånerdata$/) do
  steps %Q{
    Gitt at det finnes en mapping for konvertering
  }
  @patrons = Migration.new(@csv)
  @context[:cardnumber] = generateRandomString
  @context[:surname] = generateRandomString
  # map the first borrower for testing
  @context[:borrower_id] = @patrons.import.keys.first
  id = @context[:borrower_id]
  @patrons.import[id][:cardnumber] = @context[:cardnumber]
  @patrons.import[id][:surname] = @context[:surname]
  @patrons.import[id][:categorycode] = @context[:patron_category_code]
  @patrons.import[id][:branchcode] = @context[:branchcode]
  @patrons.to_csv
end

When(/^lånerdata migreres$/) do
  pending
end

When(/^lånerdata importeres i admingrensesnittet$/) do
  uri = URI.parse intranet(:patron_import)

  # Generate multipart form
  form_boundary = generateRandomString
  data = []
  data << "--#{form_boundary}\r\n"
  data << "Content-Disposition: form-data; name=\"uploadborrowers\"; filename=\"patrons.csv\"\r\n"
  data << "Content-Type: text/csv\r\n"
  data << "\r\n"
  data << @patrons.csv
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

  @cleanup.push( "lånernummer #{@context[:cardnumber]}" =>
    lambda do
      @browser.goto intranet(:patrons)
      @browser.text_field(:id => "searchmember").set @context[:cardnumber]
      @browser.form(:action => "/cgi-bin/koha/members/member.pl").submit
      #Phantomjs doesn't handle javascript popus, so we must override
      #the confirm function to simulate "OK" click:
      @browser.execute_script("window.confirm = function(msg){return true;}")
      @browser.button(:text => "More").click
      @browser.a(:id => "deletepatron").click
      #@browser.alert.ok #works in chrome & firefox, but not phantomjs
    end
  )
end

When(/^jeg legger til en lånerkategori som heter "(.*?)"$/) do |name|
  @browser.goto intranet(:patron_categories)
  @browser.link(:id => "newcategory").click
  @context[:patron_category_code] = name.upcase
  @context[:patron_category_description] = name
  form = @browser.form(:name => "Aform")
  form.text_field(:id => "categorycode").set @context[:patron_category_code]
  form.text_field(:id => "description").set @context[:patron_category_description]
  form.select_list(:id => "category_type").select "Adult"
  form.text_field(:id => "enrolmentperiod").set "1"  # Months
  form.submit
  @browser.form(:name => "Aform").should_not be_present

  @cleanup.push( "lånerkategori #{name}" =>
    lambda do
      @browser.goto intranet(:patron_categories)
      table = @browser.table(:id => "table_categorie")
      table.rows.each do |row|
        if row.text.include?(name)
          row.link(:href => /op=delete_confirm/).click
          @browser.input(:value => "Delete this category").click
          break
        end
      end
    end
  )
end

When(/^jeg legger inn "(.*?)" som ny låner$/) do |name|
  @browser.goto intranet(:patrons)
  @browser.button(:text => "New patron").click
  @browser.div(:class => "btn-group").ul(:class => "dropdown-menu").a.click
  form = @browser.form(:name => "form")
  form.text_field(:id => "surname").set name
  form.text_field(:id => "userid").set name
  form.text_field(:id => "password").set name
  form.text_field(:id => "password2").set name
  form.submit

  @cleanup.push( "låner #{name}" =>
    lambda do
      @browser.goto intranet(:patrons)
      @browser.text_field(:id => "searchmember").set name
      @browser.form(:action => "/cgi-bin/koha/members/member.pl").submit
      #Phantomjs doesn't handle javascript popus, so we must override
      #the confirm function to simulate "OK" click:
      @browser.execute_script("window.confirm = function(msg){return true;}")
      @browser.button(:text => "More").click
      @browser.a(:id => "deletepatron").click
      #@browser.alert.ok #works in chrome & firefox, but not phantomjs
    end
  )
end

Then(/^kan jeg se kategorien i listen over lånerkategorier$/) do
  table = @browser.table(:id => "table_categorie")
  table.wait_until_present
  table.text.should include(@context[:patron_category_code])
end

Then(/^viser systemet at "(.*?)" er låner$/) do |name|
  @browser.goto intranet(:patrons)
  @browser.a(:text => "K").click
  # Koha will open the patron details page, as long as
  # there is just one patron with surname starting with 'K'
  @browser.title.should include name
  @context[:cardnumber] = @browser.title.match(/\((.*?)\)/)[1]
end

Then(/^samsvarer de migrerte lånerdata med mapping$/) do

end

Then(/^viser systemet at låneren er importert$/) do
  @browser.goto intranet(:patrons)
  @browser.text_field(:id => "searchmember").set @context[:cardnumber]
  @browser.form(:action => "/cgi-bin/koha/members/member.pl").submit
  @browser.title.should include @context[:surname]
  @browser.link(:id => "editpatron").click
  # iterate patron advanced edit form and check for values
  patronform = @browser.form(:id => "entryform")
  @patrons.import[@context[:borrower_id]].each do |key,value|
    if value
      case "#{key}"
      when "dateofbirth"
        label = patronform.label(:for => "#{key}")
        label.parent.html.should include(Date.parse(value).strftime("%m/%d/%Y"))
      when "branchcode"
        @browser.select_list(:id => "libraries").selected?(@context[:branchname]).should == true
      when "categorycode"
        @browser.select_list(:id => "categorycode").selected?(@context[:patron_category_description]).should == true
      when "smsalertnumber"
        label = patronform.label(:for => "phone")
        label.parent.html.should include(value)
      when "sex","password","fnr","patron_attributes","old_id"
        # TODO
      else
        label = patronform.label(:for => "#{key}")
        label.parent.html.should include(value)
      end
    end
  end
end