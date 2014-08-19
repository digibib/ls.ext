# encoding: UTF-8

Given(/^jeg er på administrasjonssiden for avdelinger$/) do
  @browser.goto intranet(:branches)
end

When(/^jeg legger inn "(.*?)" som ny avdeling med avdelingskode "(.*?)"$/) do |name, code|
  @browser.link(:id => "newbranch").click
  @context[:branchname] = name
  @context[:branchcode] = code
  form = @browser.form(:name => "Aform")
  form.text_field(:id => "branchname").set @context[:branchname]
  form.text_field(:id => "branchcode").set @context[:branchcode]
  form.submit
  @browser.form(:name => "Aform").should_not be_present
end

Then(/^finnes avdelingen i oversikten over avdelinger$/) do
  table = @browser.table(:id => "branchest")
  table.should be_present
  table.text.should include(@context[:branchname])
  table.text.should include(@context[:branchcode])
end

Given(/^at det finnes en avdeling/) do
  step 'jeg er på administrasjonssiden for avdelinger'
  step 'jeg legger inn "Knuts avdeling" som ny avdeling med avdelingskode "KNUTSBIB"'
end
