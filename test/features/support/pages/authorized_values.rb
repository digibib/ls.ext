# encoding: utf-8

require_relative 'admin_page.rb'

class AuthorizedValues < AdminPage
  def visit
    @browser.goto intranet(:authorised_values)
    self
  end

  def search(category)
    form = @browser.form(:id => "category")
    form.select_list(:id => "searchfield").select_value category
    values_table.wait_until_present
    self
  end

  def exists(category)
    form = @browser.form(:id => "category")
    form.select.include?(category)
  end

  def values_table
    @browser.table(:id => "table_authorized_values")
  end

  def values_text
    values_table.text
  end

  def add(category, value, description)
    if exists category
      form = @browser.form(:id => "category")
      form.select_list(:id => "searchfield").select_value category
      @browser.a(:id => "addauth").click
      form = @browser.form(:name => "Aform")
    else
      @browser.a(:id => "addcat").click
      form = @browser.form(:name => "Aform")
      form.text_field(:id => "category").set category
    end
    form.text_field(:id => "authorised_value").set value
    form.text_field(:id => "lib").set description
    form.submit
  end


  def delete_value(value)
    values_table.rows.each do |row|
      if row.text.include?(value)
        row.link(:href => /op=delete_confirm/).click
        @browser.input(:class => "approve").click
        break
      end
    end
  end

end