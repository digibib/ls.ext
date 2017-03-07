# encoding: UTF-8
require_relative '../support/context_structs.rb'

Given(/^at boka finnes i biblioteket$/) do
  steps %Q{
    Gitt at det finnes en avdeling
    Og jeg legger inn boka som en ny bok
  }
end

Given(/^at boka er tilgjengelig$/) do
  step "viser systemet at boka er en bok som kan lånes ut"
end

Given(/^at boka er tilgjengelig \(Opac\)$/) do
  @browser.table(:id => "DataTables_Table_0").tbody.tr.cells[4].text.should eq("Available")
end

When(/^jeg legger inn boka som en ny bok$/) do
  step "at det finnes en avdeling"
  book = SVC::Biblio.new(@browser,@context,@active).add

  @active[:book] = book
  @active[:item] = book.items.first
  (@context[:books] ||= []) << book
  @cleanup.push( "bok #{book.biblionumber}" =>
    lambda do
      SVC::Biblio.new(@browser).delete(book.biblionumber)
    end
  )
end

When(/^jeg legger til et nytt eksemplar$/) do
  book = @active[:book]
  book.addItem
  book.items[1].branch   = book.items[0].branch
  book.items[1].itemtype = book.items[0].itemtype
  book.items[1].barcode  = '0301%010d' % rand(10 ** 10)

  @site.AddItem.
      visit(book.biblionumber).
      add(book.items[1].barcode, book.items[1].branch.code, book.items[1].itemtype.code)

  @active[:item] = book.items[1]
end

Then(/^viser systemet at boka er en bok som( ikke)? kan lånes ut$/) do |boolean|
  book = @active[:book]

  biblio_page = @site.BiblioDetail.visit(book.biblionumber)
  biblio_page.header.should include(book.title)

  item_status = biblio_page.item_status(book.items.first.barcode)
  if boolean
    item_status.should_not include("vailable")
  else
    item_status.should include("vailable")
  end
end
