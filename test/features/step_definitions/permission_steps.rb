#!/usr/bin/env ruby
# encoding: UTF-8
require 'csv'

Given(/^at bruker "(.*?)" har rettighet "(.*?)"$/) do |user,permission|
  @site.Patrons.visit.set_permission(user, permission)
end

Then(/^viser systemet at bruker "(.*?)" har rettighet "(.*?)"$/) do |user,permission|
  @site.Patrons.visit.check_permission(user, permission).should == true
end

When(/^brukeren har rettigheten "([^"]*)"$/) do |permission|
  @site.Patrons.visit.set_permission(@context[:patrons].first.surname, permission)
end

Given(/^at det finnes en bruker med følgende rettigheter:$/) do |permissions|
	step "at det finnes en låner med passord"
	data = permissions.raw
	data.each do |row|
	  row.each do |entry|
	    step "brukeren har rettigheten \"#{entry}\""
	  end
	end
end