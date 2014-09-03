# encoding: UTF-8

Given(/^at det finnes en avdeling$/) do
  step "jeg legger inn en ny avdeling med ny avdelingskode"
end

Given(/^at det finnes en avdeling som heter "(.*?)" med avdelingskode "(.*?)"$/) do |name,code|
  @browser.goto intranet(:branches)
  step "jeg legger inn en ny avdeling med ny avdelingskode"
end

Given(/^at det er valgt en avdeling$/) do
  step 'at det finnes en avdeling'
  @browser.goto intranet(:select_branch)
  @browser.form(:action => "selectbranchprinter.pl").submit
end

When(/^jeg er på administrasjonssiden for avdelinger$/) do
  @browser.goto intranet(:branches)
end

When(/^jeg legger inn en ny avdeling med ny avdelingskode$/) do
  @browser.goto intranet(:branches)
  @browser.link(:id => "newbranch").click
  @context[:branchname] = generateRandomString
  @context[:branchcode] = generateRandomString
  form = @browser.form(:name => "Aform")
  form.text_field(:id => "branchname").set @context[:branchname]
  form.text_field(:id => "branchcode").set @context[:branchcode]
  form.submit
  @browser.form(:name => "Aform").should_not be_present

  @cleanup.push( "avdeling #{@context[:branchname]}" =>
    lambda do
      @browser.goto intranet(:branches)
      @browser.div(:id => "branchest_filter").text_field().set(@context[:branchname])
      @browser.link(:href => "?branchcode=" + @context[:branchcode] + "&branchname=" + @context[:branchname] + "&op=delete").click
      form = @browser.form(:action => "/cgi-bin/koha/admin/branches.pl")
      if form.text.include?(@context[:branchcode])
        form.submit
      end
    end
  )
end

Then(/^finnes avdelingen i oversikten over avdelinger$/) do
  @browser.goto intranet(:branches)
  @browser.div(:id => "branchest_filter").text_field().set(@context[:branchname])
  table = @browser.table(:id => "branchest")
  table.should be_present
  table.text.should include(@context[:branchname])
  table.text.should include(@context[:branchcode])
end
