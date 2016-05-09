# encoding: UTF-8

require_relative 'catalinker_page.rb'

class RegPlace < CatalinkerPage
  def visit
    visit_sub_page(:place)
  end

  def get_link
    @browser.a(:data_automation_id => "placeofpublication_place_page_link").href
  end

  def open(resource)
    super(resource, "place")
  end
end
