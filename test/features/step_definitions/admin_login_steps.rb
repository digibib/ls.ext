# encoding: utf-8
require 'watir-webdriver'

Gitt(/^at jeg er på Kohas interne forside$/) do
  if SETTINGS['browser'] 
    @browser = Watir::Browser.new SETTINGS['browser']
  else
    # Default to phantomjs headless
    @browser = Watir::Browser.new :phantomjs
  end
  @browser.goto 'http://192.168.50.10:8081'
end

Når(/^jeg fyller inn credentials for en adminbruker og trykker Logg inn$/) do
  @browser.text_field(:id => 'userid').set SETTINGS['koha']['adminuser']
  @browser.text_field(:id => 'password').set SETTINGS['koha']['adminpass']
  @browser.button(:id => 'submit').click
end

Så(/^har jeg kommet til førstesiden til koha$/) do
  @browser.body.id.should == "main_intranet-main"
end

Så(/^vises det at jeg er pålogget$/) do
  @browser.span(:class => 'loggedinusername').should be_present
  @browser.span(:class => 'loggedinusername').text.strip.should == SETTINGS['koha']['adminuser']
end
