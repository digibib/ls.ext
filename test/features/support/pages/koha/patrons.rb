# encoding: utf-8

require_relative 'intra_page.rb'

class Patrons < IntraPage
  def visit
    @browser.goto intranet(:patrons)
    self
  end

  def create(categorydesc, firstname, surname, userid, passwd)
    @browser.button(:text => "New patron").click
    @browser.div(:class => "btn-group").ul(:class => "dropdown-menu").a(:text => categorydesc).click
    form = @browser.form(:name => "form")
    form.text_field(:id => "firstname").set firstname
    form.text_field(:id => "surname").set surname
    form.text_field(:id => "userid").set userid
    form.text_field(:id => "password").set passwd
    form.text_field(:id => "password2").set passwd
    form.button(:name => "save").click
  end

  def search(query)
    form = @browser.form(:id => "searchform")
    form.text_field(:id => "searchmember_filter").set query
    form.submit
    @browser.div(:class => 'patroninfo').wait_until_present
    @site.PatronDetails
  end

  def set_permission(name, permission)
    search("#{name}").set_permission(permission)
  end

  def check_permission(name, permission)
    search("#{name}").check_permission(permission)
  end

  def delete(name, surname)
    search("#{name} #{surname}").delete
  end
end