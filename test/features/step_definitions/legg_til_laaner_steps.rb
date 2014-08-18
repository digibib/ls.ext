# encoding: UTF-8

When(/^jeg legger inn "(.*?)" som ny låner$/) do |arg1|
  @browser.body.id.should == "main_intranet-main"
  @browser.link(:class, "icon_patrons").click
  @browser.body.id.should == "pat_member"
  pending # need story
end
