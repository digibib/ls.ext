# encoding: utf-8

require 'pry'

require 'rspec'
require 'securerandom'
require 'uri'

BROWSER_WAIT_TIMEOUT = 5 # timeout for waiting for elements to appear using Watir::Wait.until {}

# Custom classes
require_relative 'context_structs.rb'

# Custom Modules extending Cucumber World Object
# Methods are shared between all steps
require_relative 'paths.rb'
World(Paths)

#Length needs to be short enough
def generateRandomString ()
  return SecureRandom.hex(4)
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

def wait_retry
  retries ||= 1
  Watir::Wait.until(timeout: 3) do
    yield
  end
rescue Watir::Wait::TimeoutError
  unless (retries -= 1) < 0
    puts 'Refreshing and retrying'
    @browser.refresh
    retry
  else
    fail
  end
end

def wait_for
  Watir::Wait.until(timeout: BROWSER_WAIT_TIMEOUT) do
    yield
  end
end

def retry_http_request(tries=3, &block)
  begin
    yield
  rescue Errno::ETIMEDOUT, Timeout::Error, Errno::ECONNREFUSED
    STDERR.puts "HTTP Timeout: retrying ...  #{(tries -= 1)}"
    fail if (tries == 0)
    retry
  rescue RSpec::Expectations::ExpectationNotMetError => e
    STDERR.puts "Error in HTTP Request: #{e} - retrying ...  #{(tries -= 1)}"
    fail if (tries == 0)
    sleep(3)
    retry
  end
end

class CheckboxHelper
  def initialize(browser)
    @browser = browser
  end

  def set(data_automation_id, checked = true)
    checkbox = @browser.checkbox(data_automation_id: data_automation_id)
    if checkbox.checked?.eql? checked
      return
    end
    label = @browser.label(for: checkbox.id)
    if (label.exists?)
      label.click
      # In a single page app, DOM manipulations might happen after the click so that we lose the checkbox, therefore we specifically retrieve it again
      wait_for { @browser.checkbox(data_automation_id: data_automation_id).checked?.eql? checked }
    else
      raise "Label for checkbox with id #{checkbox.id} not found!"
    end
  end
end

def proxy_to_services(uri)
  new_uri = URI.parse(uri)
  new_uri.host = "services"
  new_uri.port = 8005
  return new_uri.to_s
end
