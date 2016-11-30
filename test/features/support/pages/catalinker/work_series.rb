# encoding: UTF-8

require_relative 'catalinker_page.rb'

class RegWorkSeries < CatalinkerPage
  def visit
    visit_sub_page(:work_series)
  end

  def get_link
    @browser.a(:data_automation_id => "work_series_page_link").href
  end

  def open(resource)
    super(resource, "workSeries")
  end
end
