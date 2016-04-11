# encoding: UTF-8

require_relative 'catalinker_page.rb'

class RegSubject < CatalinkerPage
  def visit
    visit_sub_page(:subject)
  end

  def get_link
    @browser.a(:data_automation_id => "subject_page_link").href
  end

  def open(resource)
    super(resource, "subject")
  end
end
