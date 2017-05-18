# encoding: UTF-8
require 'csv'
require_relative '../support/services/koha/patron.rb'

Given(/^at det finnes en lånerkategori$/) do
  steps %Q{
    Når jeg legger til en lånerkategori
  }
end

Given(/^at det finnes en låner med lånekort$/) do |table|
  #step "at det finnes en avdeling"
  branch = @context[:defaults][:branches][0]
  step "at det finnes en lånerkategori" unless (@active[:patroncategory] || @context[:patroncategories])
  patroncategory = @active[:patroncategory] ? @active[:patroncategory] : @context[:patroncategories][0]

  step "at jeg er autentisert som superbruker via REST API" unless @context[:koha_rest_api_cookie]

  patrons = table.hashes

  patrons.each do |patron|
    user = Patron.new
    # overwrite with active branch and category
    user.branch     = branch
    user.category   = patroncategory

    # merge user into Patron struct
    user.members.each do |key|
      user[key] = patron[key] if patron[key]
    end

    params = {
      categorycode: user.category.code,
      branchcode: user.branch.code,
      surname: user.surname,
      cardnumber: user.cardnumber,
      userid: user.userid,
      dateenrolled: user.dateenrolled,
      dateexpiry: user.dateexpiry,
      password: user.password,
      email: user.email
    }

    res = KohaRESTAPI::Patron.new(@browser,@context,@active).add(params)
    newuser = JSON.parse(res)
    user.borrowernumber = newuser["borrowernumber"]

    @active[:patron] = user
    (@context[:patrons] ||= []) << user

    @cleanup.push("låner #{user['surname']}" =>
      lambda do
        KohaRESTAPI::Patron.new(@browser,@context,@active).delete(user["borrowernumber"])
      end
    )

  end
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
  @site.PatronCategories.visit
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

When(/^jeg legger til en lånerkategori$/) do
  patroncategory = PatronCategory.new

  @site.PatronCategories.visit.create(patroncategory.code, patroncategory.description)

  @active[:patroncategory] = patroncategory
  (@context[:patroncategories] ||= []) << patroncategory

  @cleanup.push( "lånerkategori #{patroncategory.description}" =>
    lambda do
      @site.PatronCategories.visit.filter(patroncategory.description).delete(patroncategory.code)
    end
  )
end

When(/^jeg legger inn "(.*?)" som ny låner$/) do |name|
  patron = Patron.new
  # Branch and PatronCategory are prerequisites
  patron.branch    = @context[:defaults][:branches][0]
  patron.category  = @active[:patroncategory]
  patron.firstname = name

  # 2016-08-05: TODO Does not work with phantomjs
  # Rewritten to use API
  #@site.Patrons.
  #    visit.
  #    create(patron.category.description,
  #           name,
  #           patron.surname,
  #           "#{name}.#{patron.surname}",
  #           patron.surname)

  #@active[:patron] = patron
  #(@context[:patrons] ||= []) << patron
  #@cleanup.push( "låner #{name} #{patron.surname}" =>
  #  lambda do
  #    @site.Patrons.visit.delete(name, patron.surname)
  #  end
  #)
  step "at jeg er autentisert som superbruker via REST API"
  params = {
    categorycode: patron.category.code,
    branchcode: patron.branch.code,
    surname: patron.surname,
    firstname: patron.firstname,
    cardnumber: patron.cardnumber,
    userid: patron.userid,
    dateenrolled: patron.dateenrolled,
    dateexpiry: patron.dateexpiry
  }

  res = KohaRESTAPI::Patron.new(@browser,@context,@active).add(params)
  json = JSON.parse(res)
  patron.borrowernumber = json["borrowernumber"]
  @active[:patron] = patron
  @context[:patron] = @active[:patron]

  @cleanup.push("låner #{patron.surname}" =>
    lambda do
      KohaRESTAPI::Patron.new(@browser,@context,@active).delete(patron.borrowernumber)
    end
  )
end

Then(/^kan jeg se kategorien i listen over lånerkategorier$/) do
  select_list =  @browser.select_list(:name => "table_categorie_length")
  select_list.wait_until_present
  @browser.wait_until{ select_list.options.length > 0 }
  select_list.select_value("-1")

  table = @browser.table(:id => "table_categorie")
  table.wait_until_present
  table.text.should include @active[:patroncategory].code
end

Then(/^viser systemet at "(.*?)" er låner$/) do |name|
  fullname = "#{name} #{@active[:patron].surname}"
  patron_details = @site.Patrons.visit.search fullname
  patron_details.header.should include fullname
  @active[:patron].cardnumber = patron_details.card_number
end

Then(/^viser systemet at låneren er importert$/) do
  @browser.goto intranet(:patrons)
  @browser.text_field(:id => "searchmember").set @active[:patron].cardnumber
  @browser.form(:action => "/cgi-bin/koha/members/member.pl").submit
  @browser.title.should include @active[:patron].surname
  @browser.link(:id => "editpatron").click
  # iterate patron advanced edit form and check for values
  patronform = @browser.form(:id => "entryform")
  @migration.import[@active[:patron].cardnumber].each do |key,value|
    if value
      case "#{key}"
      when "dateofbirth"
        label = patronform.label(:for => "#{key}")
        label.parent.html.should include(Date.parse(value).strftime("%m/%d/%Y"))
      when "branchcode"
        @browser.select_list(:id => "libraries").selected?(@context[:defaults][:branches][0].name).should == true
      when "categorycode"
        @browser.select_list(:id => "categorycode_entry").selected?(@active[:patron].category.description).should == true
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
