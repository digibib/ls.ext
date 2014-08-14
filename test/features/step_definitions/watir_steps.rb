# encoding: utf-8
require 'watir-webdriver'

Gitt(/^at vi kan søke i google$/) do
  @browser = Watir::Browser.new :phantomjs
  @browser.goto "https://www.google.no"
end

Når(/^vi søker etter deichman$/) do
  @browser.text_field(:name, 'q').set 'deichman'
  @browser.button(:name, 'btnG').click
end

Så(/^vil vi finne "(.*?)"$/) do |bibname|
  @browser.div(:id => 'resultStats').wait_until_present
  @browser.text.include?(bibname).should == true
  @browser.close
end
