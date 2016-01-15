# encoding: UTF-8

require_relative 'catalinker_page.rb'

class WorkFlow < CatalinkerPage
  def visit
    @browser.goto catalinker(:workflow)
    Watir::Wait.until(BROWSER_WAIT_TIMEOUT) {
      @browser.divs(:class => 'prop-input').size > 1 # wait until dom-tree has been populated
    }
    self
  end

  def next_step
    @browser.div(:class => 'grid-panel-selected').button(:class => 'next-step-button').click
  end

  def assert_selected_tab(name_of_visible_tag)
    Watir::Wait.until(BROWSER_WAIT_TIMEOUT) do
      @browser.ul(:id => 'workflow-tabs').a(:class => 'grid-tab-link-selected').text.should eq name_of_visible_tag
    end
  end

  def add_prop(domain, predicate, value, nr=0, skip_wait=false)
    super "#{domain}_#{predicate}", value, nr, skip_wait
  end

  def select_prop(domain, predicate, value, nr=0, skip_wait=false)
    super "#{domain}_#{predicate}", value, nr, skip_wait
  end

  def get_link_to_work
    @browser.a(:data_automation_id => 'work_page_link')
  end

  def get_work_uri
    get_resource_uri 'work'
  end

  def get_publication_uri
    get_resource_uri 'publication'
  end

  def get_person_uri
    get_resource_uri 'person'
  end

  def get_resource_uri(type)
    attribute_name = "data-#{type.downcase}-uri"
    element = @browser.div(:data_automation_id => 'targetresources-uris')
    Watir::Wait.until(BROWSER_WAIT_TIMEOUT) do
      not element.attribute_value(attribute_name).empty?
    end
    element.attribute_value(attribute_name)
  end
end
