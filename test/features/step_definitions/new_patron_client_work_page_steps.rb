When(/^skal hovedtittel være "([^"]*)"$/) do |arg|
  @browser.element(data_automation_id: 'work_title').text.should eq arg
end

When(/^skal undertittel være "([^"]*)"$/) do |arg|
  @browser.element(data_automation_id: 'work_subtitle').text.should eq arg
end

When(/^skal forfatter være "([^"]*)"$/) do |arg|
  @browser.element(data_automation_id: 'work_by').text.should eq arg
end

When(/^skal originaltittel være "([^"]*)"$/) do |arg|
  @browser.element(data_automation_id: 'work_originalTitle').text.should eq arg
end

When(/^skal originalspråk være "([^"]*)"$/) do |arg|
  @browser.element(data_automation_id: 'work_originalLanguage').text.should eq arg
end

When(/^skal utgitt første gang være "([^"]*)"$/) do |arg|
  @browser.element(data_automation_id: 'work_originalReleaseDate').text.should eq arg
end

When(/^skal form være "([^"]*)"$/) do |arg|
  @browser.element(data_automation_id: 'work_literaryForms').text.should eq arg
end

When(/^skal sammendrag være "([^"]*)"$/) do |arg|
  @browser.element(data_automation_id: 'work_summary').text.should eq arg
end

When(/^skal målgruppe være "([^"]*)"$/) do |arg|
  @browser.element(data_automation_id: 'work_audiences').text.should eq arg
end

When(/^skal tilrettelagt innhold være "([^"]*)"$/) do |arg|
  @browser.element(data_automation_id: 'work_contentAdaptations').text.should eq arg
end

When(/^skal klassifikasjon være "([^"]*)"$/) do |arg|
  @browser.element(data_automation_id: 'work_classifications').text.should eq arg
end

When(/^skal biografisk innhold være "([^"]*)"$/) do |arg|
  @browser.element(data_automation_id: 'work_biographies').text.should eq arg
end

When(/^skal fag\/fiksjon være "([^"]*)"$/) do |arg|
  @browser.element(data_automation_id: 'work_fictionNonfiction').text.should eq arg
end

When(/^skal emner være "([^"]*)"$/) do |arg|
  @browser.element(data_automation_id: 'work_subjects').lis.map{ |li| li.text}.join(', ').should eq arg
end

When(/^skal sjanger være "([^"]*)"$/) do |arg|
  @browser.element(data_automation_id: 'work_genres').lis.map{ |li| li.text}.join(', ').should eq arg
end