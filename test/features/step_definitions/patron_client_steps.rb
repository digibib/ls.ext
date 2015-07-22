# encoding: UTF-8

Then(/^kommer jeg til verks\-siden for det aktuelle verket$/) do
  Watir::Wait.until { @browser.execute_script("return document.readyState") == "complete" }
  @site.PatronClient.getTitle.should include(@context[:title])
end


When(/^jeg er på sida til verket$/) do
  identifier = @context[:identifier].sub(services(:work).to_s + "/","")
  @site.PatronClient.visit(identifier)
end

Then(/^ordet "(.*?)" som førsteutgave vises IKKE på verks\-siden$/) do |arg1|
  step "jeg er på sida til verket"
  @site.PatronClient.getDate().should_not include(@context[:year])
end

Then(/^verkets årstall førsteutgave av vises på verks\-siden$/) do
  step "jeg er på sida til verket"
  @browser.refresh
  @site.PatronClient.getDate().should eq(@context[:year])
end


Then(/^språket til verkets tittel vises på verks\-siden$/) do
  step "jeg er på sida til verket"
  @browser.refresh
  @site.PatronClient.getTitle.should include("@" + @context[:title_lang])
end

Then(/^ser jeg informasjon om verkets tittel og utgivelsesår$/) do
  @browser.refresh
  @site.PatronClient.getTitle.should include(@context[:title])
  @site.PatronClient.getDate.should include(@context[:year])
end

Then(/^verkets tittel vises på verks\-siden$/) do
  step "jeg er på sida til verket"
  @site.PatronClient.getTitle.should include(@context[:title])
end

Then(/^verkets alternative tittel vises på verks\-siden$/) do
  step "jeg er på sida til verket"
  @browser.refresh
  @site.PatronClient.getTitle.should include(@context[:alt_title])
end


When(/^vises opplysningene om utgivelsen på verkssiden$/) do
  step "jeg er på sida til verket"
  @browser.td(:data_automation_id => /publication_format/).text.should eq(@context[:publication_format])
  @browser.td(:data_automation_id => /publication_language/).text.should eq(@context[:publication_language])
  @browser.td(:data_automation_id => /publication_name/).text.should eq(@context[:publication_name])

end
