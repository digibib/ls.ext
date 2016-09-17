# encoding: utf-8

require_relative 'intra_page.rb'

class BiblioDetail < IntraPage

  def visit(biblionumber)
    @browser.goto intranet(:biblio_detail) + biblionumber
    self
  end

  def header
    @browser.div(:id => 'catalogue_detail_biblio').h3.text
  end

  def status
    # TODO --- we're joining status of all items -- hacky
    item_status_column = 5
    # http://stackoverflow.com/questions/25035136/get-entire-column-text-of-a-table-using-watir
    holdings.strings.transpose[item_status_column].join('|')
  end

  def holdings
    @browser.table(:class => 'items_table')
  end

  def item_status(barcode)
    @browser.td(:text => barcode).parent.cell(:index => 5).text
  end

  def add_item_with_random_barcode_and_itemtype(itemtype)
    @browser.button(:text => "New").click
    @browser.link(:id => "newitem").click
    @browser.select_list(:id => /^s2id_tag_952_subfield_y_[0-9]+$/).select(itemtype)
    @browser.text_field(:id => /^s2id_tag_952_subfield_o_[0-9]+$/).set('%d%d%d %s%s%s' % [rand(10), rand(10), rand(10), ('A'..'Z').to_a.shuffle[0], ('a'..'z').to_a.shuffle[0], ('a'..'z').to_a.shuffle[0]])
    @browser.text_field(:id => /^s2id_tag_952_subfield_p_[0-9]+$/).set('0301%010d' % rand(10 ** 10))
    @browser.button(:text => "Add item").click
  end

  def delete_all_items
    @browser.execute_script("window.confirm = function(msg){return true;}")
    @browser.button(:text => /(Edit|Rediger)/).click
    @browser.a(:id => "deleteallitems").click
  end

  def find_first_available_exemplar
    @browser.table(class: 'items_table').trs.select { |tr| tr.td.present? && tr.td(class: 'status').text.strip.eql?('Available')}.first.tds[7].text  end
end