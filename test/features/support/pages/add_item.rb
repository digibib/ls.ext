# encoding: utf-8

require_relative 'intra_page.rb'

class AddItem < IntraPage

  def visit(biblionumber)
    @browser.goto intranet(:add_item) + biblionumber
    self
  end

  def add(barcode, branch_code, itemtype_code)
    @browser.text_field(:id => /^tag_952_subfield_p_[0-9]+$/).set barcode
    @browser.select_list(:id => /^tag_952_subfield_a_[0-9]+$/).select_value branch_code
    @browser.select_list(:id => /^tag_952_subfield_b_[0-9]+$/).select_value branch_code
    @browser.select_list(:id => /^tag_952_subfield_y_[0-9]+$/).select_value itemtype_code
    @browser.button(:name => "add_submit").click
  end

  def not_for_loan_text(barcode)
    item_row(barcode).td(:index => 5).text
  end

  def item_row(barcode)
    items_table = items_table()
    item_row_index = items_table.rows.to_a.index { |row| row.text =~ /#{barcode}/ }
    items_table.row(:index => item_row_index)
  end

  def items_table
    @browser.table(:id => "itemst")
  end

end