# encoding: utf-8

require_relative 'intra_page.rb'

class Home < IntraPage
  def go
    @browser.goto intranet(:home)
    self
  end
end