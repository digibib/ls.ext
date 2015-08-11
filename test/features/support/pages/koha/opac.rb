# encoding: utf-8

require_relative '../page_root.rb'

class Opac < PageRoot
  def visit
    @browser.goto opac
    self
  end

  def login(cardnr, password)
    if @browser.link(:id => "logout").visible?
      @browser.link(:id => "logout").click
    end
    @browser.text_field(:id => "userid").wait_until_present
    @browser.text_field(:id => "userid").set(cardnr)
    @browser.text_field(:id => "password").set(password)
    @browser.form(:id => "auth").submit
  end

  def biblio_detail(biblionumber)
    @browser.goto opac+"/cgi-bin/koha/opac-detail.pl?biblionumber=#{biblionumber}"
  end
end