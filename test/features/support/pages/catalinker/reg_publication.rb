# encoding: UTF-8

require_relative 'catalinker_page.rb'

class RegPublication < CatalinkerPage
  def visit
    visit_sub_page(:publication)
  end

  def get_record_id
    self.get_prop("http://data.deichman.no/ontology#recordId")
  end

  def get_link
    retry_wait do
      Watir::Wait.until(timeout: BROWSER_WAIT_TIMEOUT) { not @browser.inputs(:data_automation_id => 'resource_uri').first.value.to_s.empty? }
    end
    @browser.inputs(:data_automation_id => 'resource_uri').first.value
  end

  def open(resource)
    super(resource, "publication")
  end

  def open_readonly(resource)
    super(resource, "publication")
  end
end
