# encoding: UTF-8

Given(/^at det finnes en materialtype for "(.*?)" med kode "(.*?)"$/) do |name, code|
  step "jeg legger til en materialtype \"#{name}\" med kode \"#{code}\""
end

When(/^jeg legger til en materialtype "(.*?)" med kode "(.*?)"$/) do |name, code|
  @browser.goto intranet(:item_types)
  @browser.a(:id => "newitemtype").click
  form = @browser.form(:id => "itemtypeentry")
  form.text_field(:id => "itemtype").set code
  form.text_field(:id => "description").set name
  @context[:item_type_name] = name
  @context[:item_type_code] = code
  form.submit
end

Then(/^kan jeg se materialtypen i listen over materialtyper$/) do
  @browser.goto intranet(:item_types)
  table = @browser.table(:id => "table_item_type")
  table.should be_present
  table.text.should include(@context[:item_type_name])
  table.text.should include(@context[:item_type_code])
end

When(/^jeg legger inn "(.*?)" som ny bok$/) do |book|
  @browser.goto intranet(:stage_marc)
  @browser.file_field(:id => "fileToUpload").set("#{Dir.pwd}/features/upload-files/#{book}.mrc")
  @browser.button(:text => "Upload file").click
  @browser.button(:text => "Stage for import").when_present.click
  @browser.link(:text => "Manage staged records").when_present.click
  @browser.button(:name => "mainformsubmit").click
  @browser.div(:text => "Completed import of records").wait_until_present
  @context[:book_id] = @browser.a(:href => /cgi-bin\/koha\/catalogue\/detail/).when_present.text
end

Then(/^viser systemet at "(.*?)" er en bok som kan lånes ut$/) do |book|
  @browser.goto "http://#{host}:8080/cgi-bin/koha/opac-detail.pl?biblionumber=#{@context[:book_id]}"
  @browser.h1(:class => "title").text.should include(book)
  @browser.div(:id => "holdings").text.should include("Available")
end
