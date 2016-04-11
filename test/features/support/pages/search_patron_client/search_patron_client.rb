# encoding: UTF-8

require_relative '../page_root.rb'

class SearchPatronClient < PageRoot
  def visit()
    @browser.goto patron_client_search_page()
    self
  end

  def search_with_text(search_term)
    @browser.text_field(:id => 'search').set search_term
    @browser.button(:id => 'submit').click
  end

  def get_search_result_list
    @browser.divs(:class => 'result')
  end

  def follow_first_item_in_search_result
    wait_for { @browser.element(class: 'result-more').a.present? }
    @browser.element(class: 'result-more').link.click
  end

  def search_term
    wait_for {
      current_search_term = @browser.element(data_automation_id: 'current-search-term')
      current_search_term.present?
      current_search_term.text
    }
  end

  def total_hits
    wait_for { @browser.element(data_automation_id: 'hits-total').present? }
    @browser.element(data_automation_id: 'hits-total').text
  end

  def goto_search_result_page(page)
    pagination_element = @browser.element(class: 'pagination').a(text: page)
    wait_for { pagination_element.exists? }
    unless pagination_element.parent.class_name.eql? 'active'
      pagination_element.click
    end
    wait_for { @browser.element(class: 'pagination').a(text: page).parent.class_name.eql? 'active' }
    wait_for { CGI::parse(URI(@browser.url).query)['page'].include? page }
  end
end
