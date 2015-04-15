#!/usr/bin/env ruby
# encoding: UTF-8
require 'csv'

Given(/^at bruker "(.*?)" har rettighet "(.*?)"$/) do |user,permission|
  @site.Patrons.visit.set_permission(user, permission)
end

Then(/^viser systemet at bruker "(.*?)" har rettighet "(.*?)"$/) do |user,permission|
  @site.Patrons.visit.check_permission(user, permission).should == true
end