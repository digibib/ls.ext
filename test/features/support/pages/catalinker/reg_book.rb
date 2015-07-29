# encoding: UTF-8

require_relative 'catalinker_page.rb'

class RegBook < CatalinkerPage
  def visit
    visit_sub_page(:book)
  end
end
