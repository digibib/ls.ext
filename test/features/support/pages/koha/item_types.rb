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
    # the usual watir ui element manipulations seem to fail with timeout when adding new item types,
    # so default to using old school javascript
    @browser.execute_script("document.getElementById('newitemtype').click()")

    # wait for page to be partially re-render by ajax
    Watir::Wait.until(BROWSER_WAIT_TIMEOUT) {
      @browser.h3(:text => "Add item type").present?
    }

    form = @browser.form(:id => "itemtypeentry")

    # instead of:
    # form.text_field(:id => "itemtype").set code
    # use:
    @browser.execute_script("document.getElementById('itemtype').value = '" + code + "'")

    # instead of:
    # form.text_field(:id => "description").set desc
    # use:
    @browser.execute_script("document.getElementById('description').value = '" + desc + "'")

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