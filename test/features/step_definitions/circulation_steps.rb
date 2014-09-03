# encoding: UTF-8

When(/^jeg registrerer "(.*?)" som aktiv låner$/) do |patron|
  @browser.goto intranet(:home)
  @browser.text_field(:id => "findborrower").set patron
  @browser.form(:id => "patronsearch").submit
end

When(/^jeg registrerer utlån av "(.*?)"/) do |book|
  @browser.execute_script("printx_window = function() { return };") #Disable print slip popup
  form = @browser.form(:id => "mainform")
  form.text_field(:id => "barcode").set(@context[:barcode])
  form.submit

  @cleanup.push( "utlån #{@context[:barcode]}" =>
    lambda do
      @browser.goto intranet(:select_branch)
      @browser.form(:action => "selectbranchprinter.pl").submit
      @browser.a(:href => "#checkin_search").click
      @browser.text_field(:id => "ret_barcode").set @context[:barcode]
      @browser.form(:action => "/cgi-bin/koha/circ/returns.pl").submit
    end
  )
end

Then(/^registrerer systemet at "(.*?)" er utlånt$/) do |book|
  @browser.goto intranet(:home)
  @browser.a(:text => "Search the catalog").click
  form = @browser.form(:id => "cat-search-block")
  form.text_field(:id => "search-form").set(book.gsub("!", ""))
  form.submit
  @browser.text.should include(book)
end

Then(/^at "(.*?)" låner "(.*?)"$/) do |name, book|
  @browser.text.should include(book)
  @browser.text.should include "Checked out to #{name}"
end
