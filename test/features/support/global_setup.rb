require 'watir-webdriver'
require 'socket'

require_relative './site.rb'
require_relative './services/svc/preference.rb'

class GlobalSetup

  def initialize
    STDOUT.puts "Flushing memcached"

    socket = TCPSocket.new("memcached", 11211)
    socket.write("flush_all\r\n")
    result = socket.recv(2)

    if result != 'OK'
      STDERR.puts "Error flushing memcached: #{result}"
    end
    STDOUT.puts "SETUP: Populating global test settings"
    @growser = (Watir::Browser.new (ENV['BROWSER'] || "phantomjs").to_sym)
    Site.new(@growser).Login.visit.login(ENV['KOHA_ADMINUSER'], ENV['KOHA_ADMINPASS'])

    # Set language to English during testing, use global var to avvoid running before each scenario
    SVC::Preference.new(@growser).set("pref_language", "en")
    SVC::Preference.new(@growser).set("pref_opaclanguages", "en")

    # Disable item type icons due to slow loading
    SVC::Preference.new(@growser).set("pref_noItemTypeImages", "1")
  end

  def teardown
    STDOUT.puts "TEARDOWN: Undoing global test settings"
    Site.new(@growser).Login.visit.login(ENV['KOHA_ADMINUSER'], ENV['KOHA_ADMINPASS'])

    # Reset to Norwegian after all tests are run
    SVC::Preference.new(@growser).set("pref_language", "nb-NO")
    SVC::Preference.new(@growser).set("pref_opaclanguages", "nb-NO")

    SVC::Preference.new(@growser).set("pref_noItemTypeImages", "1")
    @growser.close if @growser
    @headless.destroy if @headless
  end
end

@testSuite = GlobalSetup.new

at_exit do
  @testSuite.teardown
end