# encoding: utf-8
require 'pp'

# TODO: Should pull report dir (if any) from cucumber command options
REPORT_DIR = 'report'
FileUtils.mkdir_p REPORT_DIR

def filenameify(string, sep = '-')
  filename = string.downcase
  filename.gsub!(/[^a-z0-9\-_]+/, sep)
  unless sep.nil? || sep.empty?
    re_sep = Regexp.escape(sep)
    filename.gsub!(/#{re_sep}{2,}/, sep)
    filename.gsub!(/^#{re_sep}|#{re_sep}$/, '')
  end
  filename
end

def add_screenshot(name)
  filename = "#{filenameify(name)}.png"
  screenshot = @browser.screenshot
  embed screenshot.base64, 'image/png', "Screenshot"
  screenshot.save "#{REPORT_DIR}/#{filename}" # Keep on disk, as well
end

# BEFORE HOOKS will run in the same order of which they are registered.

Before do
  @context = {}
  @cleanup = [] # A stack of operations to be undone in reversed order after feature
end

Before do
  @browser = @browser || (Watir::Browser.new (ENV['BROWSER'] || "phantomjs").to_sym)
end

#  AFTER HOOKS will run in the OPPOSITE order of which they are registered.

After do # The final hook
  @browser.close if @browser
end

def title_of(scenario)
  (defined? scenario.title) ? scenario.title : scenario.scenario_outline.title
end

After do |scenario| # cleanup based on @cleanup - in reverse order
  STDOUT.puts "--------------- Context and cleanup: #{title_of(scenario)} "
  STDOUT.puts @context.pretty_inspect

  last_cleanup_exception = nil

  step "at jeg er logget inn som adminbruker"
  @cleanup.reverse.each do |hash|
    cleanup_desc = " cleanup '#{hash.keys.first}'"
    cleanup_func = hash.values.first
    begin
      cleanup_func.call
      STDOUT.puts "#{cleanup_desc} completed"
    rescue Exception => e
      last_cleanup_exception = e
      STDOUT.puts "#{cleanup_desc} failed: #{e}"
      e.backtrace.each_with_index { |line, i| STDOUT.puts("  #{line}") if i < 3 }
      add_screenshot("#{cleanup_desc}")
    end
  end

  STDOUT.puts("Scenario failed: #{scenario.exception}") if scenario.failed?
  STDOUT.puts("Cleanup failed: #{last_cleanup_exception}") if last_cleanup_exception
  STDOUT.puts "======================================================================================== "
  STDOUT.flush
  raise Exception.new("Cleanup failed: #{last_cleanup_exception}") if !scenario.failed? && last_cleanup_exception
end

After do |scenario|
  add_screenshot(title_of(scenario)) if scenario.failed? && @browser
end
