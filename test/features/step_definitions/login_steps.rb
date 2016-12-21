# encoding: utf-8
require 'watir'

Given(/^at jeg er logget inn som adminbruker$/) do
  step "jeg fyller inn credentials for en adminbruker og trykker Logg inn"
end

When(/^jeg fyller inn credentials for en adminbruker og trykker Logg inn$/) do
  step "jeg logger på som bruker \"#{ENV['KOHA_ADMINUSER']}\" med passord \"#{ENV['KOHA_ADMINPASS']}\""
end

Given(/^at jeg er på Kohas interne forside$/) do
  @site.Home.visit
end

Given(/^jeg logger på som bruker "(.*?)" med passord "(.*?)"$/) do |userid, password|
  @site.Login.visit.login(userid, password)
  @context[:loginuser] = userid
end

Gitt(/^at låner er pålogget som låner \(Opac\)$/) do
  user = @context[:patrons][0]
  @site.Opac.visit.login(user.cardnumber, user.password)
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
  @site.Home.logged_in(@context[:loginuser]).should == true
end
