# encoding: UTF-8

require_relative 'catalinker_page.rb'

class RegPublisher < CatalinkerPage
  def visit
    visit_sub_page(:publisher)
  end

  def get_link
    @browser.a(:data_automation_id => "publisher_page_link").href
  end

  def open(resource)
    super(resource, "publisher")
  end
end
