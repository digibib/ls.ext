# encoding: UTF-8

When(/^jeg legger til en lånerkategori$/) do
  @browser.goto intranet(:patron_categories)
  @browser.link(:id => "newcategory").click
  @context[:patron_category_code] = 'VOKSEN'
  @context[:patron_category_description] = 'Voksen'
  form = @browser.form(:name => "Aform")
  form.text_field(:id => "categorycode").set @context[:patron_category_code]
  form.text_field(:id => "description").set @context[:patron_category_description]
  form.select_list(:id => "category_type").select "Adult"
  form.text_field(:id => "enrolmentperiod").set "1"  # Months
  form.submit
  @browser.form(:name => "Aform").should_not be_present
end

Given "at det finnes en lånerkategori" do
  step "jeg legger til en lånerkategori"
end

Then(/^kan jeg se kategorien i listen over lånerkategorier$/) do
  table = @browser.table(:id => "table_categorie")
  table.should be_present
  table.text.should include(@context[:patron_category_code])
end

When(/^jeg legger inn "(.*?)" som ny låner$/) do |arg1|
  @browser.body.id.should == "main_intranet-main"
  @browser.link(:class, "icon_patrons").click
  @browser.body.id.should == "pat_member"
  pending # need story
end

