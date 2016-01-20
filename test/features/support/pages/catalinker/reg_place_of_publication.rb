# encoding: UTF-8

require_relative 'catalinker_page.rb'

class RegPlaceOfPublication < CatalinkerPage
  def visit
    visit_sub_page(:place_of_publication)
  end

  def get_link
    @browser.a(:data_automation_id => "place_of_publication_page_link").href
  end

  def open(resource)
    super(resource, "placeOfPublication")
  end
end
