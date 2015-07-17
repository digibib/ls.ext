# encoding: UTF-8

require_relative 'catalinker_page.rb'

class RegEdition < CatalinkerPage
  def visit
    visit_sub_page(:edition)
  end
end
