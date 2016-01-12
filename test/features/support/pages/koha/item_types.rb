# encoding: utf-8

require_relative 'admin_page.rb'

class ItemTypes < AdminPage
  def visit
    @browser.goto intranet(:item_types)
    self
  end

  def show_all
    @browser.select_list(:name => "table_item_type_length").select_value("-1")
    self
  end

  def create(code, desc)
    tries = 10
    begin
    Watir::Wait.until(BROWSER_WAIT_TIMEOUT) {
      @browser.a(:id => "newitemtype").present?
    }
    rescue Watir::Wait::TimeoutError
      STDERR.puts "TIMEOUT: retrying .... #{(tries -= 1)}"
      if (tries == 0)
        fail
      else
        retry
      end
    end
    @browser.a(:id => "newitemtype").click
    form = @browser.form(:id => "itemtypeentry")
    form.text_field(:id => "itemtype").set code
    form.text_field(:id => "description").set desc
    form.submit
    self
  end

  def delete(code)
    item_type_table.rows.each do |row|
      if row.text.include?(code)
        row.link(:href => /op=delete_confirm/).click
        @browser.input(:value => "Delete this Item Type").click
        break
      end
    end
  end

  def exists(code, desc)
    text = item_type_table.text
    text.should include(code)
    text.should include(desc)
    self
  end

  def item_type_table
    table =  @browser.table(:id => "table_item_type")
    table.wait_until_present
    table
  end

end