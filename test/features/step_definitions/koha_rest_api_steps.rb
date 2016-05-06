# encoding: UTF-8
require_relative '../support/services/svc/user.rb'
require_relative '../support/services/koha/reserve.rb'
require_relative '../support/services/koha/patron.rb'

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
	KohaRESTAPI::Auth.new(@browser,@context,@active).login("super", "secret")
end

When(/^låneren reserverer boka via API$/) do
	params = {
		biblionumber: @active[:book].biblionumber.to_i,
		branchcode: @active[:branch].code,
		borrowernumber: @active[:patron].borrowernumber.to_i
	}
	res = KohaRESTAPI::Reserve.new(@browser,@context,@active).add(params)
  @context[:reserve] = JSON.parse(res)

  @cleanup.push("reservering #{@context[:reserve]['reserve_id']} på bok #{@context[:reserve]['biblionumber']}" =>
    lambda do
      KohaRESTAPI::Reserve.new(@browser,@context,@active).delete(@context[:reserve]["reserve_id"])
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
end

When(/^jeg registrerer låneren via API$/) do
  params = {
    categorycode: @active[:patron].category.code,
    branchcode: @active[:patron].branch.code,
    surname: @active[:patron].surname,
    cardnumber: @active[:patron].cardnumber,
    userid: @active[:patron].userid
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
