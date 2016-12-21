# encoding: UTF-8

require_relative '../page_root.rb'

class SearchPatronClient < PageRoot
  def visit
    @browser.goto patron_client_search_page
    self
  end

  def search_with_text(search_term)
    @browser.text_field(data_automation_id: 'search_input_field').set search_term
    @browser.element(data_automation_id: 'search_button').click
    wait_for { not @browser.element(data_automation_id: 'is_searching').present? }
  end

  def get_search_result_list
    @browser.elements(:class => 'single-entry')
  end

  def follow_first_item_in_search_result
    wait_retry { @browser.link(data_automation_id: 'work-link').present? }
    @browser.link(data_automation_id: 'work-link').click
  end

  def search_term
    wait_retry { @browser.element(data_automation_id: 'current-search-term').present? }
    @browser.element(data_automation_id: 'current-search-term').text
  end

  def total_hits
    wait_retry { @browser.element(data_automation_id: 'hits-total').present? }
    @browser.element(data_automation_id: 'hits-total').text
  end

  def goto_search_result_page(page)
    pagination_element = @browser.element(class: 'pagination').a(text: page)
    wait_retry { pagination_element.exists? }
    unless pagination_element.parent.class_name.eql? 'active'
      pagination_element.click
    end
    wait_retry { @browser.element(class: 'pagination').a(text: page).parent.class_name.eql? 'active' }
    wait_retry {
      (CGI::parse(URI(@browser.url).query)['page'].empty? && page.eql?('1')) ||
          CGI::parse(URI(@browser.url).query)['page'].include?(page)
    }
  end
end
