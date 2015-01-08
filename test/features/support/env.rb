# encoding: utf-8

require 'rspec'
require 'yaml'
require 'securerandom'

if !File.exists? '/srv/pillar/koha/admin.sls'
  puts "missing koha minion admin.sls; aborting"
  Cucumber.wants_to_quit = true
else
  SETTINGS = YAML.load_file('/srv/pillar/koha/admin.sls')
end

# Custom classes

# Custom Modules extending Cucumber World Object
# Methods are shared between all steps
require_relative 'users.rb'
require_relative 'paths.rb'
World(Paths,Users)

#Length needs to be short enough
def generateRandomString ()
  return SecureRandom.hex(4)
end

# method to ensure ajax calls have returned within timeout
def wait_for_ajax(timeout=5)
  timeout.times do
    return true if @browser.execute_script('return jQuery.active').to_i == 0
    sleep(1)
  end
  raise Watir::Wait::TimeoutError, "Timeout of #{timeout} seconds exceeded on waiting for Ajax."
end

