# encoding: UTF-8

require_relative '../page_root.rb'

class CatalinkerPage < PageRoot

  def visit_sub_page(page)
    @browser.goto catalinker(page)
    Watir::Wait.until(timeout: BROWSER_WAIT_TIMEOUT) {
      @browser.url != catalinker(page) && # wait until we have been redirected
          @browser.divs(:class => "prop-input").size > 1 # wait until dom-tree has been populated
    }
    self
  end

  def open(resource, res_type)
    @browser.goto "#{catalinker(:home)}/#{res_type}?resource=#{resource}"
    Watir::Wait.until(timeout: BROWSER_WAIT_TIMEOUT) { @browser.divs(:class => "prop-input").size > 1 }
    self
  end

  def open_readonly(resource, res_type)
    @browser.goto "#{catalinker(:home)}/#{res_type}?resource=#{resource}&readOnly=true"
    Watir::Wait.until(timeout: BROWSER_WAIT_TIMEOUT) { @browser.divs(:class => "prop-input").size > 1 }
    self
  end

  def add_prop_skip_wait(predicate, value, nr=0)
    return add_prop predicate, value, nr, true
  end

  def add_prop(predicate, value, nr=0, skip_wait=false)
    input = @browser.elements(:data_automation_id => predicate+"_#{nr}").find(&:visible?).to_subtype
    input.focus
    input.set('')
    Watir::Wait.until(timeout: BROWSER_WAIT_TIMEOUT) { input.value == '' }
    input.set(value)
    input.fire_event :blur
    unless skip_wait
      retry_wait do
        Watir::Wait.until(timeout: BROWSER_WAIT_TIMEOUT) { @browser.div(:id => /save-stat/).text === 'alle endringer er lagret' }
      end
    end
    self
  end

  def search_resource(predicate, value, nr=0)
    input = @browser.text_field(:data_automation_id => predicate+"_#{nr}")
    input.set(value)
    @browser.send_keys :enter
  end

  def select_resource(uri)
    tries = 3
    begin
      @browser.div(:data_automation_id => uri).wait_until_present(timeout: BROWSER_WAIT_TIMEOUT).click
    rescue Watir::Wait::TimeoutError
      STDERR.puts "TIMEOUT: retrying .... #{(tries -= 1)}"
      retry unless tries == 0
    end
  end

  def select_prop(predicate, value, nr=0, skip_wait=false, domain="")
    if (domain != "")
      domain="_#{domain}"
    end
    input = @browser.select_list(:data_automation_id => "#{domain}#{predicate}_#{nr}")
    Watir::Wait.until(timeout: BROWSER_WAIT_TIMEOUT) { input.length > 1 }
    input.select(value)
#    @browser.screenshot.save "./report/#{Time.now}_screenshot.png"
    unless skip_wait
      retry_wait do
        Watir::Wait.until(timeout: BROWSER_WAIT_TIMEOUT) { @browser.div(:id => /save-stat/).text === 'alle endringer er lagret' }
      end
    end
    self
  end

  def get_available_select_choices(predicate, nr=0)
    @browser.select_list(:data_automation_id => "#{predicate}_#{nr}").options
  end

  def get_available_select_choices_as_text(predicate, nr=0)
    @browser.select_list(:data_automation_id => "#{predicate}_#{nr}").options.map(&:text)
  end

  def get_prop_count(predicate)
    @browser.elements(:data_automation_id => /#{predicate}_\d+/).size
  end

  def get_prop(predicate, nr=0)
    input = @browser.text_field(:data_automation_id => "#{predicate}_#{nr}")
    Watir::Wait.until(timeout: BROWSER_WAIT_TIMEOUT) { input.value != "" }
    input.value
  end

  def get_prop_from_span(predicate, nr=0)
    span = @browser.span(:data_automation_id => "#{predicate}_#{nr}")
    Watir::Wait.until(timeout: BROWSER_WAIT_TIMEOUT) { span.text != "" }
    span.text
  end

  def get_prop_by_label(input_label, nr=0)
    input = @browser.inputs(:xpath => '//label[@data-uri-escaped-label="' + URI::escape(input_label) + '"]/../../following-sibling::div/input')[0]
    Watir::Wait.until(timeout: BROWSER_WAIT_TIMEOUT) { input.value != "" }
    input.value
  end

  def get_select_prop(predicate, nr=0)
    input = @browser.select_list(:data_automation_id => "#{predicate}_#{nr}")
    selected_options = input.selected_options
    if (selected_options.size.eql? 1)
      selected_options.first.text
    else
      selected_options.map do |option|
      end
    end
  end

  def get_select_prop_by_label(selectable_parameter_label, index=0)
    select = @browser.selects(:xpath => '//label[@data-uri-escaped-label="' + URI::escape(selectable_parameter_label) + '"]/../../following-sibling::div/select')[index]
    selected_options = select.selected_options
    if (selected_options.size.eql? 1)
      selected_options.first.text
    else
      selected_options.map do |option|
      end
    end
  end

  def get_id
    Watir::Wait.until(timeout: BROWSER_WAIT_TIMEOUT) { @browser.input(:data_automation_id => /resource_uri/).value != "" }
    @browser.input(:data_automation_id => /resource_uri/).value
  end

  def errors
    @browser.div(:id => "errors").text
  end
end
