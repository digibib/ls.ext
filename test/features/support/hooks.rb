
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

After do |scenario|
  if scenario.failed? && @browser
    add_screenshot(scenario.title)
  end
end

After('@libraryCreated') do |step| 
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
  # This was a dead end - No cookie handling...
  # uri = URI.parse 'http://192.168.50.10:8081/cgi-bin/koha/admin/branches.pl'
  # res = Net::HTTP.post_form(uri, 'op' => 'delete_confirmed', 
  #   'branchcode' => @context[:branchcode], 
  #   'branchname' => @context[:branchname])
  # res.code.should == '200'
end