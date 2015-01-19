# encoding: utf-8

require_relative 'intra_page.rb'

class CatalogueDetail < IntraPage
  def biblio_title
    @browser.div(:id => 'catalogue_detail_biblio').h1.text
  end

  def item_status
    # TODO --- we're joining status of all items -- hacky
    item_status_column = 5
    # http://stackoverflow.com/questions/25035136/get-entire-column-text-of-a-table-using-watir
    holdings.strings.transpose[item_status_column].join('|')
  end

  def holdings
    @browser.table(:class => 'items_table')
  end
end