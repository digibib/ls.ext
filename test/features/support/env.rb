# encoding: utf-8

require 'pry'
require 'pry-nav' # https://banisterfiend.wordpress.com/2012/02/14/the-pry-ecosystem/

require 'rspec'
require 'yaml'
require 'securerandom'

BROWSER_WAIT_TIMEOUT = 5 # timeout for waiting for elements to appear using Watir::Wait.until {}
PILLAR = YAML.load_file('/srv/pillar/koha/init.sls')

# Merge in Koha credentials
if !File.exists? '/srv/pillar/koha/admin.sls'
  puts "missing koha minion admin.sls; aborting"
  Cucumber.wants_to_quit = true
else
  PILLAR["koha"].merge!(YAML.load_file('/srv/pillar/koha/admin.sls')["koha"])
end


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
