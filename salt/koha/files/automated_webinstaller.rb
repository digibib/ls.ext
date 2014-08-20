#!/usr/bin/env ruby
# encoding: utf-8
require 'watir-webdriver'
require 'net/http'

Watir.default_timeout = 5
browser = Watir::Browser.new :phantomjs
# Go to front page - expect redirect to installer
uri = URI.parse(ENV['URL'])
last_response = Net::HTTP.get_response(uri) #default is :follow_redirect => false
case last_response.code
  when '405' # Apache installed but no Koha instance found
    raise "Instance is not installed"
  when '200'
    raise "Instance is already installed"
  when '302' # Redirect to webinstaller
    res = browser.goto ENV['URL']
    if browser.execute_script("return document.readyState") == "complete"
      if browser.url == "#{ENV['URL']}/cgi-bin/koha/installer/install.pl"
        form = browser.form(:id => "mainform")
        form.text_field(:id => "userid").set ENV['USER']
        form.text_field(:id => "password").set ENV['PASS']
        form.submit
        browser.form(:name => "language").submit
        browser.form(:name => "checkmodules").submit
        browser.form(:name => "checkinformation").submit
        browser.form(:name => "checkdbparameters").submit
        browser.form().submit
        browser.form().submit
        browser.link(:href => "install.pl?step=3&op=choosemarc").click
        browser.radio(:name => "marcflavour", :value => "MARC21").set
        browser.form(:name => "frameworkselection").submit
        browser.form(:name => "frameworkselection").submit
        browser.form(:name => "finish").submit
        exit 0
      else
        raise "Installer not found at expected url #{ENV['URL']}"
      end
    end
  else
    raise "Something else happened"
end
browser.close