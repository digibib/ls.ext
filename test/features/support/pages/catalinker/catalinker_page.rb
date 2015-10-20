# encoding: UTF-8

require_relative '../page_root.rb'

class CatalinkerPage < PageRoot

    def visit_sub_page(page)
      @browser.goto catalinker(page)
      Watir::Wait.until(BROWSER_WAIT_TIMEOUT) {
        @browser.url != catalinker(page) &&            # wait until we have been redirected
        @browser.divs(:class => "prop-input").size > 1 # wait until dom-tree has been populated
      }
      self
    end

    def open(resource, res_type)
      @browser.goto "#{catalinker(:home)}/#{res_type}?resource=#{resource}"
      Watir::Wait.until(BROWSER_WAIT_TIMEOUT) { @browser.divs(:class => "prop-input").size > 1 }
      self
    end

    def add_prop(predicate, value, nr=0)
      input = @browser.text_field(:data_automation_id => predicate+"_#{nr}")
      input.set("")
      Watir::Wait.until(BROWSER_WAIT_TIMEOUT) { input.value == "" }
      input.set(value)
      input.fire_event :blur
      self
    end

    def select_prop(predicate, value, nr=0)
      input = @browser.select_list(:data_automation_id => predicate+"_#{nr}")
      Watir::Wait.until(BROWSER_WAIT_TIMEOUT) { input.length > 1 }
      input.select(value)
      self
    end

    def get_prop(predicate, nr=0)
      input = @browser.text_field(:data_automation_id => predicate+"_#{nr}")
      Watir::Wait.until(BROWSER_WAIT_TIMEOUT) { input.value != "" }
      input.value
    end

    def get_id()
      Watir::Wait.until(BROWSER_WAIT_TIMEOUT) { @browser.input(:data_automation_id => /resource_uri/).value != "" }
      @browser.input(:data_automation_id => /resource_uri/).value
    end

    def errors
      @browser.div(:id => "errors").text
    end
end
