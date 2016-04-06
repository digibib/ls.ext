# encoding: UTF-8

require_relative 'catalinker_page.rb'

class WorkFlow < CatalinkerPage
  def visit
    retry_wait do
      @browser.goto catalinker(:workflow)
      Watir::Wait.until(BROWSER_WAIT_TIMEOUT) do
        @browser.refresh
        sleep 5
        @browser.divs(:class => 'prop-input').size > 1
      end # wait until dom-tree has been populated
    end
    self
  end

  def next_step
    @browser.div(:class => 'grid-panel-selected').button(:class => 'next-step-button').click
  end

  def assert_selected_tab(name_of_visible_tag)
    Watir::Wait.until(BROWSER_WAIT_TIMEOUT) do
      @browser.ul(:id => 'workflow-tabs').a(:class => 'grid-tab-link-selected').text.eql? name_of_visible_tag
    end
  end

  def add_prop(domain, predicate, value, nr=0, skip_wait=false)
    super "#{domain}_#{predicate}", value, nr, skip_wait
  end

  def select_prop(domain, predicate, value, nr=0, skip_wait=false)
    @browser.inputs(:xpath => "//span[@data-automation-id='#{domain}_#{predicate}_#{nr}']//input[@type='search']")[0].click
    @browser.elements(:xpath => "//span[@class='select2-results']/ul/li[text()='#{value}']")[0].click
  end

  def get_available_select_choices(domain, predicate, nr=0)
    super "#{domain}_#{predicate}", nr
  end

  def get_available_select_choices_as_text(domain, predicate, nr=0)
    super "#{domain}_#{predicate}", nr
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

  def get_text_field_from_label(label)
    @browser.text_field(:xpath => "//span[./preceding-sibling::div[contains(concat(' ',normalize-space(@class),' '),' label ')][@data-uri-escaped-label='#{URI::escape(label)}']]//input[@type='search']")
  end

  def finish
    @browser.buttons(:text => "Avslutt registrering av utgivelsen").first.click
  end
end
