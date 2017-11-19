# encoding: UTF-8
require_relative '../support/services/koha/hold.rb'
require_relative '../support/services/koha/patron.rb'
require_relative '../support/services/koha/item.rb'

# Superlibrarian user should not be deleted after creation
Given(/^at det finnes en superbruker$/) do
  step "at jeg er logget inn som superbruker"
  true # api-user set up by services
end

Given(/^at jeg er autentisert som superbruker via REST API$/) do
	step "at det finnes en superbruker"
  step "at jeg er logget på som superbruker via REST API"
end

Given(/^at jeg er logget på som superbruker via REST API$/) do
  KohaRESTAPI::Auth.new(@browser,@context,@active).login(ENV['KOHA_API_USER'], ENV['KOHA_API_PASS'])
end

When(/^låneren reserverer boka via API$/) do
  params = {
    biblionumber: @context[:koha].biblio["biblio"]["biblionumber"].to_i,
    branchcode: @context[:koha].patrons[0]["branchcode"],
    borrowernumber: @context[:koha].patrons[0]["borrowernumber"].to_i
  }
  res = KohaRESTAPI::Hold.new(@browser,@context,@active).add(params)
  @context[:reserve] = JSON.parse(res)

  @cleanup.push("reservering #{@context[:reserve]['reserve_id']} på bok #{@context[:reserve]['biblionumber']}" =>
    lambda do
      KohaRESTAPI::Hold.new(@browser,@context,@active).delete(@context[:reserve]["reserve_id"])
    end
  )
end

Then(/^gir APIet tilbakemelding om at boka er reservert$/) do
  @context[:reserve]["biblionumber"].should eq(@context[:koha].biblio["biblio"]["biblionumber"].to_i)
  @context[:reserve]["branchcode"].should eq(@context[:defaults][:branches][0].code)
  @context[:reserve]["borrowernumber"].should eq(@context[:koha].patrons[0]["borrowernumber"].to_i)
end

Given(/^at jeg har mottatt opplysninger om en låner$/) do
  @active[:patron] = Patron.new
  @active[:patron].branch = Branch.new("hutl")
  @active[:patron].category = PatronCategory.new("V")
  @active[:patron].dateenrolled = (DateTime.now).strftime("%F").to_s
  @active[:patron].dateexpiry = (DateTime.now + 360).strftime("%F").to_s
end

When(/^jeg registrerer låneren via API$/) do
  params = {
    categorycode: @active[:patron].category.code,
    branchcode: @active[:patron].branch.code,
    surname: @active[:patron].surname,
    cardnumber: @active[:patron].cardnumber,
    userid: @active[:patron].userid,
    dateenrolled: @active[:patron].dateenrolled,
    dateexpiry: @active[:patron].dateexpiry
  }

  res = KohaRESTAPI::Patron.new(@browser,@context,@active).add(params)
  @context[:patron] = JSON.parse(res)

  @cleanup.push("låner #{@context[:patron]['surname']}" =>
    lambda do
      KohaRESTAPI::Patron.new(@browser,@context,@active).delete(@context[:patron]["borrowernumber"])
    end
  )
end

Then(/^gir APIet tilbakemelding om at låneren er registrert$/) do
  @context[:patron]['borrowernumber'].should_not be(nil)
  @context[:patron]['surname'].should eq(@active[:patron].surname)
  @context[:patron]['userid'].should eq(@active[:patron].userid)
end

Given(/^at det er registrert en låner via API$/) do
  step "at jeg har mottatt opplysninger om en låner"
  step "jeg registrerer låneren via API"
end

Given(/^at låneren har lånt en bok$/) do
  #step "at låneren har materiale han ønsker å låne"
  @site.SelectBranch.visit.select_branch(@active[:patron].branch.code)
  @site.Home.visit.find_patron_for_checkout("#{@active[:patron].surname}")
  step "jeg registrerer utlån av boka"
end

When(/^jeg sjekker lånerens aktive lån via API$/) do
  res = KohaRESTAPI::Checkouts.new(@browser,@context,@active).list(@context[:koha].patrons[0]["borrowernumber"])
  @context[:checkouts] = JSON.parse(res)
end

Then(/^finnes boka i listen over aktive lån fra APIet$/) do
  itemnumber   = @context[:checkouts][0]["itemnumber"]
  biblionumber = @active[:book] ?
    @active[:book].biblionumber :
    @context[:koha].biblio["biblio"]["biblionumber"]
  issuestable = @site.IssueHistory.visit(biblionumber).issues
  issue = issuestable.rows[0]
  issue.links[1].href.should include("itemnumber=#{itemnumber}")
  #Date.parse(issue.tds[5].text).should eq(Date.parse(@context[:checkouts][0]["date_due"]))
end

When(/^jeg lister alle avdelinger via API$/) do
  res = KohaRESTAPI::Libraries.new(@browser,@context,@active).list
  @context[:api_libraries_list] = JSON.parse(res)
end

Then(/^forventer jeg å finne avdelingen i listen$/) do
  @context[:api_libraries_list].find do |library|
    library["branchcode"] == @context[:branches][0].code &&
    library["branchname"] == @context[:branches][0].name
  end.should_not be(nil)
end

When(/^jeg slår opp eksemplaret via API$/) do
  itemnumber = @context[:checkouts][0]["itemnumber"]
  res = KohaRESTAPI::Items.new(@browser,@context,@active).get_extended_biblio(itemnumber)
  @context[:extended_item_biblio] = JSON.parse(res)
end

Then(/^vil systemet vise detaljert eksemplarinformasjon$/) do
  @context[:extended_item_biblio]["biblionumber"].to_i.should eq(@context[:koha].biblio["biblio"]["biblionumber"].to.i)
  @context[:extended_item_biblio]["title"].should eq(@context[:koha].biblio["biblio"]["title"])
end

Given(/^låner vil endre meldingspreferanser$/) do
  @context[:messagepreferences] = KohaRESTAPI::MessagePreferences.new(@browser,@context,@active).get(@context[:patron]['borrowernumber'])
end

When(/^nye meldingspreferanser sendes til Kohas API$/) do
  new_prefs = {
    item_due: { transports: ["sms","email"], wants_digest: 1},
    advance_notice: { transports: ["email"], wants_digest: 0, days_in_advance: 5},
    hold_filled: { transports: ["sms"], wants_digest: 0 },
    item_check_in: { transports: ["email"], wants_digest: 1}, # Yes, it is check_in, not checkin
    item_checkout: { transports: ["email"], wants_digest: 1}
  }
  res = KohaRESTAPI::MessagePreferences.new(@browser,@context,@active).update(@context[:patron]['borrowernumber'], new_prefs)
  @context[:new_messagepreferences] = JSON.parse(res)
end

Then(/^gir APIet tilbakemelding om at de nye meldingspreferansene er registrert$/) do
  new_prefs = @context[:new_messagepreferences]
  new_prefs.should_not eq(@context[:messagepreferences])
  [:item_due, :advance_notice, :hold_filled, :item_check_in, :item_checkout].all? {|k| new_prefs.key? k}
  new_prefs["item_due"]["wants_digest"].should == "1"
  new_prefs["item_due"]["transports"].should include("email", "sms")
  new_prefs["advance_notice"]["days_in_advance"].should == "5"
end

Given(/^at det finnes informasjon om en bok med eksemplarer$/) do
  step "at det finnes en avdeling"

  book = Book.new
  book.addItem # generates unique item with barcode
  book.items.first.branch   = @context[:defaults][:branches][0]
  book.items.first.itemtype = @context[:defaults][:item_type]
  @active[:book] = book
end

When(/^jeg legger inn boka via Kohas API$/) do
  marcxml = File.read("features/upload-files/Fargelegg byen!.marc21", :encoding => 'UTF-8')
  marcxml = marcxml.gsub(/\{\{ book_title \}\}/, @active[:book].title)
  marcxml = marcxml.gsub(/\{\{ branchcode \}\}/, @context[:defaults][:branches][0].code)                 # must be existing branchcode
  marcxml = marcxml.gsub(/\{\{ item_type_code \}\}/, @context[:defaults][:item_type][:code])           # must be existing item type
  marcxml = marcxml.gsub(/\{\{ item_barcode \}\}/, @active[:book].items.first.barcode)  # must be unique barcode

  res = KohaRESTAPI::Biblios.new(@browser,@context,@active).add(marcxml)
  json = JSON.parse(res.body)
  @context[:biblio_api_response] = {
    url: res["Location"],
    biblionumber: json["biblionumber"],
    items: json["items"]
  }
  @active[:book].biblionumber = json["biblionumber"]
  @cleanup.push( "biblio #{@context[:biblio_api_response][:biblionumber]}" =>
    lambda do
      KohaRESTAPI::Biblios.new(@browser,@context,@active).delete(@context[:biblio_api_response][:biblionumber])
    end
  )
end

Then(/^kan jeg følge lenken og finne den bibliografiske posten$/) do
  headers = {
    'Cookie' => @context[:koha_rest_api_cookie],
    'Content-Type' => 'application/json'
  }
  http = Net::HTTP.new("xkoha", 8081)
  uri = URI(@context[:biblio_api_response][:url])
  res = http.get(uri, headers)
  expect(res.code).to eq("200"), "got unexpected #{res.code} when fetching biblio.\nResponse body: #{res.body}"
  json = JSON.parse(res.body)
  json["biblionumber"].to_i.should eq(@context[:biblio_api_response][:biblionumber].to_i)
end

When(/^at jeg autentiserer brukeren mot Kohas REST API$/) do
  res = KohaRESTAPI::Auth.new(@browser,@context,@active).login(@active[:patron].userid, @active[:patron].password)
  json = JSON.parse(res.body)
  @context[:session_api_response] = json
end

Then(/^gir APIet tilbakemelding med riktige brukerrettigheter$/) do
  session = @context[:session_api_response]
  session["borrowernumber"].should eq(@active[:patron].borrowernumber)
  session["permissions"].sort.should eq(["borrowers", "editcatalogue", "staffaccess"].sort)
end

When(/^systemet sender ut en velkomst\-epost$/) do
  @context[:session_api_response] = KohaRESTAPI::Messaging.new(@browser,@context,@active).send_account_details(@active[:patron].borrowernumber)
end
