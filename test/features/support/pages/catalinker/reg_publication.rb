# encoding: UTF-8

require_relative 'catalinker_page.rb'

class RegPublication < CatalinkerPage
  def visit
    visit_sub_page(:publication)
  end

  def get_record_id
    self.get_prop("http://192.168.50.12:8005/ontology#recordID")
  end

  def get_link
    @browser.inputs(:data_automation_id => 'resource_uri').first.value
  end

  def open(resource)
    super(resource, "publication")
  end
end
