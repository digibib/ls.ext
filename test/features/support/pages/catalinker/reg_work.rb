# encoding: UTF-8

require_relative 'catalinker_page.rb'

class RegWork < CatalinkerPage
  def visit
    visit_sub_page(:work)
  end

  def get_link
    @browser.a(:data_automation_id => "work_page_link").href
  end
end
