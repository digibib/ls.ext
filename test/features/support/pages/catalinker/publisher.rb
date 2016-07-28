# encoding: UTF-8

require_relative 'catalinker_page.rb'

class RegCorporation < CatalinkerPage
  def visit
    visit_sub_page(:corporation)
  end

  def get_link
    @browser.a(:data_automation_id => "corporation_page_link").href
  end

  def open(resource)
    super(resource, "corporation")
  end
end
