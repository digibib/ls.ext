# encoding: UTF-8

require_relative '../page_root.rb'

class CatalinkerClient < PageRoot
    def ontology_ns
      "http://192.168.50.12:8005/ontology#"
    end

    def visit
      @browser.goto catalinker_client(:home)
      self
    end

    def add(title, author, date, biblio)
      btn = @browser.button(:data_automation_id => /new_work_button/)
      btn.wait_until_present
      Watir::Wait.until { btn.enabled? }
      btn.click

      addTriple("name", title)
      addTriple("year", date)
      addTriple("biblio", biblio) if biblio
      addTriple("creator", author)

      self
    end

    def addTriple(field, value)
      @browser.select_list(:data_automation_id => /predicate_selector/).select_value(self.ontology_ns+field)
      Watir::Wait.until { @browser.button(:text => "+").enabled? }
      @browser.button(:text => "+").click
      input = @browser.text_field(:data_automation_id => self.ontology_ns+field)
      input.wait_until_present
      input.set(value)
    end

    def get_id()
      w = @browser.h2(:data_automation_id => "work_id").text
    end
end
