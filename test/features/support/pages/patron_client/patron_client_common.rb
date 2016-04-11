# encoding: UTF-8

require_relative '../page_root.rb'

class PatronClientCommon < PageRoot
  def visit()
    @browser.goto patron_client()
    self
  end

  def current_language
    @browser.select(class: 'languageselector').selected_options.first.text
  end

  def select_language(language)
    @browser.select(class: 'languageselector').select(language)
  end
end