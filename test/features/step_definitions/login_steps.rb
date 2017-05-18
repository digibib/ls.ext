# encoding: utf-8
require 'watir'

Given(/^at jeg er logget inn som superbruker$/) do
  step "jeg logger på som bruker \"super\" med passord \"secret\""
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
