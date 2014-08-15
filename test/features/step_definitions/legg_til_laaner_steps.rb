# encoding: UTF-8

Given(/^at admin\-bruker er logget inn$/) do
  step "at jeg er på Kohas interne forside"
  step "jeg fyller inn credentials for en adminbruker og trykker Logg inn"
end

Når(/^Admin\-bruker legger inn "(.*?)" som ny låner$/) do |arg1|
  @browser.body.id.should == "main_intranet-main"
  @browser.link(:class, "icon_patrons").click
  @browser.body.id.should == "pat_member"
  pending # need story
end

Så(/^registrerer systemet at "(.*?)" er låner$/) do |arg1|
  pending # express the regexp above with the code you wish you had
end
