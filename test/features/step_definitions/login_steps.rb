# encoding: utf-8
require 'watir-webdriver'

Given(/^at jeg er logget inn som adminbruker$/) do
  @browser.goto intranet(:login)
  step "jeg fyller inn credentials for en adminbruker og trykker Logg inn"
end

When(/^jeg fyller inn credentials for en adminbruker og trykker Logg inn$/) do
  step "jeg logger på som bruker \"#{SETTINGS['koha']['adminuser']}\" med passord \"#{SETTINGS['koha']['adminpass']}\""
end

Given(/^at jeg er på Kohas interne forside$/) do
  @browser.goto intranet(:home)
end

Given(/^jeg logger på som bruker "(.*?)" med passord "(.*?)"$/) do |userid, password|
  @context[:loginuser] = userid
  @browser.text_field(:id => 'userid').set @context[:loginuser]
  @browser.text_field(:id => 'password').set password
  @browser.button(:id => 'submit').click
end

Given(/^at jeg er pålogget som adminbruker$/) do
  steps %Q{
    Gitt at jeg er på Kohas interne forside
    Når jeg fyller inn credentials for en adminbruker og trykker Logg inn
  }
end

Then(/^har jeg kommet til førstesiden til koha$/) do
  @browser.body.id.should == "main_intranet-main"
end

Then(/^vises det at jeg er pålogget$/) do
  @browser.span(:class => 'loggedinusername').should be_present
  @browser.span(:class => 'loggedinusername').text.strip.should == @context[:loginuser]
end
