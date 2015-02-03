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
require_relative 'context_structs.rb'

# Custom Modules extending Cucumber World Object
# Methods are shared between all steps
require_relative 'paths.rb'
World(Paths)

#Length needs to be short enough
def generateRandomString ()
  return SecureRandom.hex(4)
end
