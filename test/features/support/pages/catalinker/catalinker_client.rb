# encoding: UTF-8

require_relative '../page_root.rb'

class CatalinkerClient < PageRoot
    def visit
      @browser.goto catalinker_client(:home)
      self
    end

    def add(title, author, date, biblio)
      @browser.button(:data_automation_id => /new_work_button/).click

      addTriple("navn", title)
      addTriple("skaper", author)
      addTriple("dato", date)
      addTriple("biblio ID", biblio) if biblio

      self
    end

    def addTriple(field, value)
      predicate_selector = @browser.element(:data_automation_id => /predicate_selector/)
      predicate_selector.wait_until_present
      predicate_selector.click
      predicate_selector.send_keys field, :tab, :enter

      input = @browser.text_field(:data_automation_id => field)
      input.set(value)
    end

    def get_id()
      throw "Not supported yet."
    end
end
