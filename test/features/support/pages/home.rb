# encoding: utf-8

require_relative 'intra_page.rb'

class Home < IntraPage
  def visit
    @browser.goto intranet(:home)
    self
  end
end