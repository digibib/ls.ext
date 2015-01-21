# encoding: UTF-8
require 'csv'
require 'net/http'
require 'uri'
require 'json'
require_relative '../support/migration.rb'
 
Given(/^at en låner ikke finnes som låner hos biblioteket fra før$/) do
  steps %Q{
    Gitt at det finnes en lånerkategori
    Og at det finnes en avdeling
  }
end

Given(/^at det finnes en lånerkategori$/) do
  steps %Q{
    Når jeg legger til en lånerkategori
  }
end

Given(/^at "(.*?)" eksisterer som en låner$/) do |name|
  steps %Q{
    Gitt at det finnes en lånerkategori
    Når jeg legger inn \"#{name}\" som ny låner
    Så viser systemet at \"#{name}\" er låner
  }
end

Given(/^at det finnes en låner$/) do
  step "at \"Knut\" eksisterer som en låner"
end

Given(/^at det finnes en låner med lånekort$/) do |table|
  steps %Q{
    Gitt at det finnes en avdeling
    Og at det finnes en lånerkategori
  }
  patrons = table.hashes

  patrons.each do |patron|
    patron = patron.inject({}){|h,(k,v)| h.merge({ k.to_sym => v}) } # Symbolize keys
    import_user_via_csv(patron)
  end

end

Given(/^at det finnes data som beskriver en låner$/) do
  @import = File.join(File.dirname(__FILE__), '..', 'upload-files', 'patrons.csv')
end

Given(/^at det finnes en mapping for konvertering$/) do
  @map = File.join(File.dirname(__FILE__), '..', 'upload-files', 'mapping_patrons.csv')
end

Given(/^at det finnes konverterte lånerdata$/) do
  steps %Q{
    Gitt at det finnes en mapping for konvertering
    Når lånerdata migreres
  }
end

Given(/^at jeg har en liste over lånerkategorier$/) do
  @borrower_categories = File.join(File.dirname(__FILE__), '..', 'upload-files', 'borrower_categories.csv')
end

Given(/^at låneren ikke har utestående purregebyr$/) do
  @browser.div(:id => "finesholdsissues").table.should_not be_present
end


Given(/^at låneren ikke er fratatt lånerretten$/) do
  @browser.div(:id => "reldebarments").table.should_not be_present
end

Given(/^at låneren ikke har aktiv innkrevingssak$/) do
  next    # TODO: This function is not implemented yet
  pending # express the regexp above with the code you wish you had
end

When(/^jeg er på administrasjonssiden for lånerkategorier$/) do
  @browser.goto intranet(:patron_categories)
end

When(/^jeg velger å vise alle lånerkategorier$/) do
  @browser.select_list(:name => "table_categorie_length").select_value("-1")
end

Then(/^samsvarer listen i grensesnittet med liste over lånerkategorier$/) do
  rows = @browser.table(:id => "table_categorie").tbody.rows
  orig = []
  rows.each do |row|
    orig << { :categorycode => row[0].text, :description => row[1].text }
  end
  csv = []
  CSV.foreach(@borrower_categories, {
      :headers => true, 
      :encoding => 'UTF-8',
      :header_converters => :symbol
    }) do |c|
      csv << { :categorycode => c[:categorycode], :description => c[:description] }
  end
  # Array comparison
  a = (orig & csv == orig)
  b = (csv & orig == csv)

  a.should == true
  b.should == true

end

When(/^lånerdata migreres$/) do
  @migration = Migration.new(@map, @import)
  @patron = Patron.new
  @patron.category = @patroncategory
  @patron.branch   = @branch

  # map the first borrower for testing
  @patron.borrowernumber = @migration.import.keys.first
  id = @patron.borrowernumber
  @migration.import[id][:cardnumber]   = @patron.cardnumber
  @migration.import[id][:surname]      = @patron.surname
  @migration.import[id][:categorycode] = @patron.category.code
  @migration.import[id][:branchcode]   = @patron.branch.code
end

When(/^lånerdata importeres i admingrensesnittet$/) do
  # import_user_via_csv takes @patron Struct
  import_user_via_csv(@migration.import[@patron.borrowernumber])
end

When(/^jeg legger til en lånerkategori$/) do
  @browser.goto intranet(:patron_categories)
  @browser.link(:id => "newcategory").click
  @patroncategory = PatronCategory.new

  form = @browser.form(:name => "Aform")
  form.text_field(:id => "categorycode").set @patroncategory.code
  form.text_field(:id => "description").set @patroncategory.description
  form.select_list(:id => "category_type").select "Adult"
  form.text_field(:id => "enrolmentperiod").set "1"  # Months
  form.submit
  @browser.form(:name => "Aform").should_not be_present

  @context[:patroncategory] = @patroncategory
  @cleanup.push( "lånerkategori #{@patroncategory.description}" =>
    lambda do
      @browser.goto intranet(:patron_categories)
      table = @browser.table(:id => "table_categorie")
      table.rows.each do |row|
        if row.text.include?(@patroncategory.description)
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
  @patron = Patron.new
  # Branch and PatronCategory are prerequisites
  @patron.branch   = @branch
  @patron.category = @patroncategory

  @browser.button(:text => "New patron").click
  @browser.div(:class => "btn-group").ul(:class => "dropdown-menu").a(:text => @patron.category.description).click
  form = @browser.form(:name => "form")
  form.text_field(:id => "firstname").set name
  form.text_field(:id => "surname").set @patron.surname
  form.text_field(:id => "userid").set "#{name}.#{@patron.surname}"
  form.text_field(:id => "password").set @patron.surname
  form.text_field(:id => "password2").set @patron.surname
  form.button(:name => "save").click

  @context[:patron] = @patron
  @cleanup.push( "låner #{name} #{@patron.surname}" =>
    lambda do
      @browser.goto intranet(:patrons)
      @browser.text_field(:id => "searchmember").set "#{name} #{@patron.surname}"
      @browser.form(:action => "/cgi-bin/koha/members/member.pl").submit
      @browser.div(:class => 'patroninfo').wait_until_present
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
  @browser.select_list(:name => "table_categorie_length").select_value("-1")
  table.wait_until_present
  table.text.should include @patroncategory.code
end

Then(/^viser systemet at "(.*?)" er låner$/) do |name|
  fullname = "#{name} #{@patron.surname}"
  #patron_search
  @browser.goto intranet(:patrons)
  @browser.text_field(:id => "searchmember").set "#{fullname}"
  @browser.form(:action => "/cgi-bin/koha/members/member.pl").submit
  @browser.div(:class => 'patroninfo').wait_until_present
  patroninfo_header = @browser.div(:class => 'patroninfo').h5.text
  patroninfo_header.should include fullname
  @patron.cardnumber = patroninfo_header.match(/\((.*?)\)/)[1]
end

Then(/^samsvarer de migrerte lånerdata med mapping$/) do
  @migration.map.each do |field,map|
    if map[:teststatus] && map[:teststatus].downcase == 'ok'
      @migration.import[@patron.borrowernumber].keys.to_s.should include(map[:plassering_i_koha])
    end
  end
end

Then(/^viser systemet at låneren er importert$/) do
  @browser.goto intranet(:patrons)
  @browser.text_field(:id => "searchmember").set @patron.cardnumber
  @browser.form(:action => "/cgi-bin/koha/members/member.pl").submit
  @browser.title.should include @patron.surname
  @browser.link(:id => "editpatron").click
  # iterate patron advanced edit form and check for values
  patronform = @browser.form(:id => "entryform")
  @migration.import[@patron.borrowernumber].each do |key,value|
    if value
      case "#{key}"
      when "dateofbirth"
        label = patronform.label(:for => "#{key}")
        label.parent.html.should include(Date.parse(value).strftime("%m/%d/%Y"))
      when "branchcode"
        @browser.select_list(:id => "libraries").selected?(@branch.name).should == true
      when "categorycode"
        @browser.select_list(:id => "categorycode_entry").selected?(@patron.category.description).should == true
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
