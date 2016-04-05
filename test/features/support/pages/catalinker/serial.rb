# encoding: UTF-8

require_relative 'catalinker_page.rb'

class RegSerial < CatalinkerPage
  def visit
    visit_sub_page(:serial)
  end

  def get_link
    @browser.a(:data_automation_id => "serial_page_link").href
  end

  def open(resource)
    super(resource, "serial")
  end
end
