# encoding: UTF-8

require_relative '../page_root.rb'

class CatalinkerPage < PageRoot

    def visit_sub_page(page)
      @browser.goto catalinker(page)
      Watir::Wait.until { @browser.execute_script("return document.readyState") == "complete" }
      self
    end

    def open(resource, res_type)
      @browser.goto "#{catalinker(:home)}/#{res_type}?resource=#{resource}"
      Watir::Wait.until { @browser.execute_script("return document.readyState") == "complete" }
      self
    end

    def add_prop(predicate, value, nr=0)
      input = @browser.text_field(:data_automation_id => predicate+"_#{nr}")
      input.set("")
      Watir::Wait.until { input.value == "" }
      input.set(value)
      input.fire_event :blur
      self
    end

    def get_id()
      Watir::Wait.until { @browser.input(:data_automation_id => /work_uri/).value != "" }
      @browser.input(:data_automation_id => /work_uri/).value
    end

    def errors
      @browser.div(:id => "errors").text
    end
end
