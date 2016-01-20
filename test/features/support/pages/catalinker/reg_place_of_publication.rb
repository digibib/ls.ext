# encoding: UTF-8

require_relative 'catalinker_page.rb'

class RegPlaceOfPublication < CatalinkerPage
  def visit
    visit_sub_page(:placeofpublication)
  end

  def get_link
    @browser.a(:data_automation_id => "placeofpublication_place_page_link").href
  end

  def open(resource)
    super(resource, "placeOfPublication")
  end
end
