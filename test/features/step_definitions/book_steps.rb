# encoding: UTF-8

Given(/^at det finnes en materialtype$/) do
  @browser.goto intranet(:item_types)
  step "jeg legger til en materialtype"
end

Given(/^at boka finnes i biblioteket$/) do
  steps %Q{
    Gitt at det finnes en avdeling
    Når jeg legger til en materialtype
    Og jeg legger inn boka som en ny bok
  }
end

Given(/^at boka er tilgjengelig$/) do
  step "viser systemet at boka er en bok som kan lånes ut"
end

When(/^jeg legger inn boka som en ny bok$/) do
  step "at det finnes en avdeling"       unless @active[:branch]
  step "jeg legger til en materialtype"  unless @active[:itemtype]
  book = SVC::Biblio.new(@browser,@context,@active).add

  @active[:book] = book
  @active[:item] = book.items.first
  (@context[:books] ||= []) << book
  @cleanup.push( "bok #{book.biblionumber}" =>
    lambda do
      SVC::Biblio.new(@browser).delete(book)
    end
  )
end

When(/^jeg legger til et nytt eksemplar$/) do
  book = @active[:book]
  book.addItem
  book.items[1].branch   = book.items[0].branch
  book.items[1].itemtype = book.items[0].itemtype

  @browser.goto intranet(:add_item) + book.biblionumber
  @browser.text_field(:id => /^tag_952_subfield_p_[0-9]+$/).set book.items[1].barcode
  @browser.select_list(:id => /^tag_952_subfield_a_[0-9]+$/).select_value book.items[1].branch.code
  @browser.select_list(:id => /^tag_952_subfield_b_[0-9]+$/).select_value book.items[1].branch.code
  @browser.select_list(:id => /^tag_952_subfield_y_[0-9]+$/).select_value book.items[1].itemtype.code
  @browser.button(:name => "add_submit").click
  @active[:item] = book.items[1]
end

When(/^jeg legger til en materialtype$/) do
  @browser.goto intranet(:item_types)
  @browser.a(:id => "newitemtype").click
  form = @browser.form(:id => "itemtypeentry")
  itemtype = ItemType.new

  form.text_field(:id => "itemtype").set itemtype.code
  form.text_field(:id => "description").set itemtype.desc
  form.submit

  @active[:itemtype] = itemtype
  (@context[:itemtypes] ||= []) << itemtype
  @cleanup.push( "materialtype #{itemtype.code}" =>
    lambda do
      @browser.goto intranet(:item_types)
      table = @browser.table(:id => "table_item_type")
      table.wait_until_present
      table.rows.each do |row|
        if row.text.include?(itemtype.code)
          row.link(:href => /op=delete_confirm/).click
          @browser.input(:value => "Delete this Item Type").click
          break
        end
      end
    end
  )
end

Then(/^kan jeg se materialtypen i listen over materialtyper$/) do
  @browser.goto intranet(:item_types)
  table = @browser.table(:id => "table_item_type")
  @browser.select_list(:name => "table_item_type_length").select_value("-1")
  table.wait_until_present
  table.text.should include(@active[:itemtype].code)
  table.text.should include(@active[:itemtype].desc)
end

Then(/^viser systemet at boka er en bok som( ikke)? kan lånes ut$/) do |boolean|
  book = @active[:book]
  @browser.goto intranet(:bib_record) + book.biblionumber
  @browser.div(:id => "catalogue_detail_biblio").text.should include(book.title)
  holdings = @browser.div(:id => "holdings")
  barcode = holdings.tbody.tr.td(:index => 7).text
  status = @browser.td(:text => book.items.first.barcode)
  status = status.parent.cell(:index => 5)
  if boolean
    status.text.should_not include("vailable")
  else
    status.text.should include("vailable")
  end
end

Then(/^kan jeg søke opp boka$/) do
  catalogue_detail = Home.new(@browser).search_catalog(@active[:book].title)
  catalogue_detail.biblio_title.should include(@active[:book].title)
  catalogue_detail.item_status.should include("vailable")
end
