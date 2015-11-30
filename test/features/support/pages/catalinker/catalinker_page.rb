# encoding: UTF-8

require_relative '../page_root.rb'

class CatalinkerPage < PageRoot

  def visit_sub_page(page)
    @browser.goto catalinker(page)
    Watir::Wait.until(BROWSER_WAIT_TIMEOUT) {
      @browser.url != catalinker(page) && # wait until we have been redirected
          @browser.divs(:class => "prop-input").size > 1 # wait until dom-tree has been populated
    }
    self
  end

  def open(resource, res_type)
    @browser.goto "#{catalinker(:home)}/#{res_type}?resource=#{resource}"
    Watir::Wait.until(BROWSER_WAIT_TIMEOUT) { @browser.divs(:class => "prop-input").size > 1 }
    self
  end

  def add_prop_expect_error(predicate, value, nr=0)
    return add_prop predicate, value, nr, true
  end

  def add_prop(predicate, value, nr=0, expect_error=false)
    input = @browser.text_field(:data_automation_id => predicate+"_#{nr}")
    input.set('')
    Watir::Wait.until(BROWSER_WAIT_TIMEOUT) { input.value == '' }
    input.set(value)
    input.fire_event :blur
    unless expect_error
      retry_wait do
        Watir::Wait.until(BROWSER_WAIT_TIMEOUT) { @browser.div(:id => /save-stat/).text === 'alle endringer er lagret' }
      end
    end
    self
  end

  def retry_wait
    tries = 3
    begin
      yield
    rescue Watir::Wait::TimeoutError
      STDERR.puts "TIMEOUT: retrying .... #{(tries -= 1)}"
      if (tries == 0)
        fail
      else
        retry
      end
    end
  end

  def search_resource(predicate, value, nr=0)
    input = @browser.text_field(:data_automation_id => predicate+"_#{nr}")
    input.set(value)
    @browser.send_keys :enter
  end

  def select_resource(uri)
    tries = 3
    begin
      @browser.div(:data_automation_id => uri).when_present(BROWSER_WAIT_TIMEOUT).click
    rescue Watir::Wait::TimeoutError
      STDERR.puts "TIMEOUT: retrying .... #{(tries -= 1)}"
      retry unless tries == 0
    end
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
