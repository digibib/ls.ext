# encoding: utf-8

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
  @browser.screenshot.save "#{REPORT_DIR}/#{filename}"
  embed filename, 'image/png'
end

# BEFORE HOOKS will run in the same order of which they are registered.

Before do
  @context = {}
end

#  AFTER HOOKS will run in the opposite order of which they are registered.

After do # The final hook
  @browser.close if @browser
end

After do |scenario|
  add_screenshot(scenario.title) if scenario.failed? && @browser
end

After('@libraryCreated') do
  @browser.goto intranet(:branches)
  table = @browser.table(:id => "branchest")
  table.wait_until_present
  table.rows.each do | row |
    if row.text.include?("#{@context[:branchcode]}")
      row.link(:href => /op=delete/).click
      break # the click will cause navigation so iterating more might fail
    end
  end
  form = @browser.form(:action => "/cgi-bin/koha/admin/branches.pl")
  if form.text.include?("#{@context[:branchcode]}")
    form.submit
  end
end
