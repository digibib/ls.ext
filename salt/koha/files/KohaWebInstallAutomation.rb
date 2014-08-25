#!/usr/bin/env ruby
# encoding: utf-8

require 'watir-webdriver'
require 'net/http'
require 'uri'

class KohaWebInstallAutomation

  def initialize (uri, user, pass)

    @uri = uri
    @user = user
    @pass = pass

    test_response_code

  end

  def test_response_code

    response = Net::HTTP.get_response URI.parse @uri #default is :follow_redirect => false

    case response
      when Net::HTTPSuccess
      #check what the URI actually is
        location = response['location']
        case location
          when location == @uri
            STDOUT.puts  "{\"comment\":\"Instance is already installed\"}"
            exit 0
          else
            raise "HTTPSuccess, but it is unclear how we got to" + @uri
        end
      when Net::HTTPRedirection
        location = response['location']
        clickthrough_installer location
      else
        raise "The response code was " + response
    end
  end

  def clickthrough_installer uri

    Watir.default_timeout = 5
    browser = Watir::Browser.new :phantomjs
    browser.goto @uri + uri

    if browser.execute_script("return document.readyState") == "complete"
      if browser.url == @uri + uri
        form = browser.form(:id => "mainform")
        form.text_field(:id => "userid").set @user
        form.text_field(:id => "password").set @pass
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
        STDOUT.puts "{\"comment\":\"Successfully completed the install process\"}"
        browser.close
        exit 0
      else
        raise "Installer not found at expected url " + @uri + uri + ", instead got " + browser.url.to_s
      end
    end
  end
end