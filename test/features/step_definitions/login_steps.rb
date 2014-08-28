# encoding: utf-8
require 'watir-webdriver'

Given(/^at jeg er logget inn som adminbruker$/) do
  @browser.goto intranet(:login)
  @context[:user] = SETTINGS['koha']['adminuser']
  @browser.text_field(:id => 'userid').set @context[:user]
  @browser.text_field(:id => 'password').set SETTINGS['koha']['adminpass']
  @browser.button(:id => 'submit').click
end

Given(/^at jeg er på Kohas interne forside$/) do
  @browser.goto intranet(:home)
end

Given(/^at jeg er logget inn som "(.*?)"$/) do |name|
  @browser.goto intranet(:login)
  @browser.text_field(:id => 'userid').set name
  @browser.text_field(:id => 'password').set name
  @browser.button(:id => 'submit').click
end

Given(/^at jeg er pålogget som adminbruker$/) do
  steps %Q{
    Gitt at jeg er på Kohas interne forside
    Når jeg fyller inn credentials for en adminbruker og trykker Logg inn
  }
end

When(/^jeg fyller inn credentials for en adminbruker og trykker Logg inn$/) do
  @context[:user] = SETTINGS['koha']['adminuser']
  @browser.text_field(:id => 'userid').set @context[:user]
  @browser.text_field(:id => 'password').set SETTINGS['koha']['adminpass']
  @browser.button(:id => 'submit').click
end

Then(/^har jeg kommet til førstesiden til koha$/) do
  @browser.body.id.should == "main_intranet-main"
end

Then(/^vises det at jeg er pålogget$/) do
  @browser.span(:class => 'loggedinusername').should be_present
  @browser.span(:class => 'loggedinusername').text.strip.should == @context[:user]
end
