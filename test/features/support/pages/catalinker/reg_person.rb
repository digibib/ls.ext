# encoding: UTF-8

require_relative 'catalinker_page.rb'

class RegPerson < CatalinkerPage
  def visit
    visit_sub_page(:person)
  end

  def get_link
    @browser.a(:data_automation_id => "person_page_link").href
  end
end
