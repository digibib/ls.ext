# encoding: utf-8

require_relative 'intra_page.rb'

class BiblioDetail < IntraPage

  def visit(biblionumber)
    @browser.goto intranet(:biblio_detail) + biblionumber
    self
  end

  def header
    @browser.div(:id => 'catalogue_detail_biblio').h1.text
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

end