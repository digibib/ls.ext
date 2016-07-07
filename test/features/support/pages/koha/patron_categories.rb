# encoding: utf-8

require_relative 'admin_page.rb'

class PatronCategories < AdminPage
  def visit
    @browser.goto intranet(:patron_categories)
    self
  end

  def filter(name)
    @browser.div(:id => "table_categorie_filter").text_field().set name
    self
  end

  def create(code, desc, type="A", enrollment_months=1)
    @browser.link(:id => "newcategory").click
    form = @browser.form(:id => "category_form")
    form.text_field(:id => "categorycode").set code
    form.text_field(:id => "description").set desc
    form.select_list(:id => "category_type").select_value type
    form.text_field(:id => "enrolmentperiod").set enrollment_months.to_s  # Months
    form.submit
    # Make sure we succeeded
    @browser.form(:id => "category_form").should_not be_present
    self
  end

  def delete(categorycode)
    @browser.link(:href => "/cgi-bin/koha/admin/categories.pl?op=delete_confirm&categorycode=" + categorycode).click
    form = @browser.form(:action => "/cgi-bin/koha/admin/categories.pl")
    if form.hidden(:name, "categorycode").value == categorycode
      form.submit
    end
    @browser.div(:class => "dialog message").text.should =~ /deleted|slettet/
    self
  end
end