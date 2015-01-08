#!/usr/bin/env ruby
# encoding: UTF-8
require 'csv'

Given(/^at bruker "(.*?)" har rettighet "(.*?)"$/) do |user,permission|
  @browser.goto intranet(:patrons)
  @browser.text_field(:id => "searchmember").set "#{user}"
  @browser.form(:action => "/cgi-bin/koha/members/member.pl").submit
  @browser.execute_script("window.confirm = function(msg){return true;}")
  @browser.button(:text => "More").click
  @browser.a(:id => "patronflags").click
  form = @browser.form(:action => "/cgi-bin/koha/members/member-flags.pl")
  form.checkbox(:value => "#{permission}").set
  form.submit
end
