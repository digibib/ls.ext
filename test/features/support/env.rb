require 'rspec'
require 'yaml'

if !File.exists? 'saltdeploy/koha/pillar/koha/admin.sls'
  puts "missing koha minion admin.sls; aborting"
  Cucumber.wants_to_quit = true
else
  SETTINGS = YAML.load_file('saltdeploy/koha/pillar/koha/admin.sls')
end
