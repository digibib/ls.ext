# encoding: utf-8

require_relative 'admin_page.rb'

class PatronCategories < AdminPage
  def go
    @browser.goto intranet(:patron_categories)
    self
  end

  def create(code, desc, type="Adult", enrollment_months=1)
    @browser.link(:id => "newcategory").click
    form = @browser.form(:name => "Aform")
    form.text_field(:id => "categorycode").set code
    form.text_field(:id => "description").set desc
    form.select_list(:id => "category_type").select type
    form.text_field(:id => "enrolmentperiod").set enrollment_months.to_s  # Months
    form.submit
    # Make sure we succeeded
    @browser.form(:name => "Aform").should_not be_present
    self
  end

  def delete(desc)
    table = @browser.table(:id => "table_categorie")
    table.rows.each do |row|
      if row.text.include?(desc)
        row.link(:href => /op=delete_confirm/).click
        @browser.input(:value => "Delete this category").click
        break
      end
    end
  end
end