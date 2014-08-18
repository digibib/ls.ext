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

Before do
  @context = {}
end

After do |scenario|
  if scenario.failed? && @browser
    add_screenshot(scenario.title)
  end
end

After('@libraryCreated') do
  table = @browser.table(:id, "branchest")
  table.rows.each do | row |
    if row.text.include?("#{@context[:branchcode]}")
      row.link(:href => /op=delete/).click
    end
  end
  form = @browser.form(:action => "/cgi-bin/koha/admin/branches.pl")
  if form.text.include?("#{@context[:branchcode]}")
    form.submit
  end
end