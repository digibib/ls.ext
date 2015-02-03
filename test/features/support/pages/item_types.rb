# encoding: utf-8

require_relative 'admin_page.rb'

class ItemTypes < AdminPage
  def visit
    @browser.goto intranet(:item_types)
    self
  end

  def create(code, desc)
    @browser.a(:id => "newitemtype").click
    form = @browser.form(:id => "itemtypeentry")

    form.text_field(:id => "itemtype").set code
    form.text_field(:id => "description").set desc
    form.submit
    self
  end

  def delete(code)
    table = @browser.table(:id => "table_item_type")
    table.wait_until_present
    table.rows.each do |row|
      if row.text.include?(code)
        row.link(:href => /op=delete_confirm/).click
        @browser.input(:value => "Delete this Item Type").click
        break
      end
    end
  end

  def exists(code, desc)
    table = @browser.table(:id => "table_item_type")
    @browser.select_list(:name => "table_item_type_length").select_value("-1")
    table.wait_until_present
    table.text.should include(code)
    table.text.should include(desc)
    self
  end
end