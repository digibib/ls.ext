# encoding: utf-8

require_relative '../page_root.rb'

class Login < PageRoot
  def visit
    @browser.goto intranet(:login)
    self
  end

  def login(userid, password)
    @browser.text_field(:id => 'userid').set userid
    @browser.text_field(:id => 'password').set password
    @browser.button(:id => 'submit').click
    self
  end
end

