# encoding: UTF-8

require_relative 'catalinker_page.rb'

class RegPublication < CatalinkerPage
  def visit
    visit_sub_page(:publication)
  end
end
