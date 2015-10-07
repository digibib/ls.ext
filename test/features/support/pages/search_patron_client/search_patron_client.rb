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
    return @browser.div(:class=> 'result')
  end

  def follow_first_item_in_search_result
    @browser.link(:class=> 'more').click
  end
end