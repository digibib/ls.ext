# encoding: UTF-8
require_relative '../support/services/svc/user.rb'
require_relative '../support/services/koha/reserve.rb'

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
		biblionumber: @active[:biblionumber],
		branchcode: @active[:branch].code,
		borrowernumber: @active[:patron].borrowernumber
	}
	res = KohaRESTAPI::Reserve.new(@browser,@context,@active).add(params)
	STDOUT.puts res.inspect
end

Then(/^gir APIet tilbakemelding om at boka er reservert$/) do
  pending # Write code here that turns the phrase above into concrete actions
end
