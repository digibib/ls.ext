# encoding: UTF-8
Given(/^at jeg er pålogget som adminbruker$/) do
  step "at jeg er på Kohas interne forside"
  step "jeg fyller inn credentials for en adminbruker og trykker Logg inn"
end

Given(/^er på administrasjonssiden for avdelinger$/) do
  @browser.goto "http://192.168.50.10:8081/cgi-bin/koha/admin/branches.pl"
  @browser.link(:id => "newbranch").click
end

When(/^jeg legger inn "(.*?)" som ny avdeling med avdelingskode "(.*?)"$/) do |name, code|
  @context[:branchname] = name
  @context[:branchcode] = code
  form = @browser.form(:name => "Aform")
  form.text_field(:id => "branchname").set @context[:branchname]
  form.text_field(:id => "branchcode").set @context[:branchcode]
  form.submit
  @browser.form(:name => "Aform").should_not be_present
end

Then(/^finnes avdelingen i oversikten over avdelinger$/) do
  table = @browser.table(:id, "branchest")
  table.should be_present
  table.text.should include(@context[:branchname])
  table.text.should include(@context[:branchcode])
end

