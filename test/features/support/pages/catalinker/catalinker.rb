# encoding: UTF-8

require_relative '../page_root.rb'

class Catalinker < PageRoot
    def visit
      @browser.goto catalinker(:work)
      self
    end

    def add(title, author, date, biblio)
      @browser.text_field(:data_automation_id => /work_title/).set(title)
      @browser.text_field(:data_automation_id => /work_creator/).set(author)
      @browser.text_field(:data_automation_id => /work_date/).set(date)
      @browser.text_field(:data_automation_id => /work_biblioId/).set(biblio) if biblio
      @browser.button(:class => "submit").click
      self
    end

    def get_id()
      @browser.input(:data_automation_id => /work_uri/).value
    end
end
