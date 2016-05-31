# encoding: UTF-8
require_relative '../support/services/svc/user.rb'
require_relative '../support/services/koha/hold.rb'
require_relative '../support/services/koha/patron.rb'
require_relative '../support/services/koha/item.rb'

# Superlibrarian user should not be deleted after creation
Given(/^at det finnes en superbruker$/) do
  step "at jeg er logget inn som adminbruker"

  unless SVC::User.new(@browser,@context,@active).exists?("Librarian, Super")
    # prereq: library and patron category
    branchcode   = generateRandomString
    branchname   = generateRandomString
    categorycode = generateRandomString
    categorydesc = generateRandomString

    @site.Branches.visit.create(branchname, branchcode)
    @site.PatronCategories.visit.create(categorycode, categorydesc, "Staff")
    @site.Patrons.visit.create(categorydesc, "Super", "Librarian", "super", "secret")
    @site.PatronDetails.set_permission("superlibrarian")
    # Maybe unneccessary step to validate automat user has correct permission
    @site.Patrons.visit.check_permission("Librarian, Super", "superlibrarian")
  end
end

Given(/^at jeg er autentisert som superbruker via REST API$/) do
	step "at det finnes en superbruker"
  step "at jeg er logget på som superbruker via REST API"
end

Given(/^at jeg er logget på som superbruker via REST API$/) do
  KohaRESTAPI::Auth.new(@browser,@context,@active).login("super", "secret")
end

When(/^låneren reserverer boka via API$/) do
	params = {
		biblionumber: @active[:book].biblionumber.to_i,
		branchcode: @active[:branch].code,
		borrowernumber: @active[:patron].borrowernumber.to_i
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
  @context[:reserve]["biblionumber"].should eq(@active[:book].biblionumber)
  @context[:reserve]["branchcode"].should eq(@active[:branch].code)
  @context[:reserve]["borrowernumber"].should eq(@active[:patron].borrowernumber)
end

Given(/^at jeg har mottatt opplysninger om en låner$/) do
  step "at det finnes en avdeling"        unless @active[:branch]
  step "jeg legger til en lånerkategori"  unless @active[:patroncategory]
  @active[:patron] = Patron.new
  @active[:patron].branch = @active[:branch]
  @active[:patron].category = @active[:patroncategory]
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
  step "at låneren har materiale han ønsker å låne"
  @site.Home.visit.find_patron_for_checkout("#{@active[:patron].surname}")
  step "jeg registrerer utlån av boka"
end

When(/^jeg sjekker lånerens aktive lån via API$/) do
  res = KohaRESTAPI::Checkouts.new(@browser,@context,@active).list(@active[:patron].borrowernumber)
  @context[:checkouts] = JSON.parse(res)
end

Then(/^finnes boka i listen over aktive lån fra APIet$/) do
  itemnumber   = @context[:checkouts][0]["itemnumber"]
  biblionumber = @active[:book].biblionumber
  issuestable = @site.IssueHistory.visit(biblionumber).issues
  issue = issuestable.rows[0]
  issue.tds[0].text.should eq(@active[:patron].surname)
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
  @context[:extended_item_biblio]["biblionumber"].should eq(@context[:books][0].biblionumber)
  @context[:extended_item_biblio]["title"].should eq(@context[:books][0].title)
end

Given(/^låner vil endre meldingspreferanser$/) do
  @context[:messagepreferences] = KohaRESTAPI::MessagePreferences.new(@browser,@context,@active).get(@context[:patron]['borrowernumber'])
end

When(/^nye meldingspreferanser sendes til Kohas API$/) do
  new_prefs = {
    item_due: { transports: ["sms","email"], wants_digest: true},
    advance_notice: { transports: ["email"], wants_digest: false, days_in_advance: 5},
    hold_filled: { transports: ["sms"], wants_digest: false },
    item_check_in: { transports: ["email"], wants_digest: true}, # Yes, it is check_in, not checkin
    item_checkout: { transports: ["email"], wants_digest: true}
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
