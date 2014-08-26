# encoding: UTF-8

When(/^jeg registrerer "(.*?)" som aktiv låner$/) do |patron|
  @browser.goto intranet(:home)
  @browser.text_field(:id => "findborrower").set patron
  @browser.form(:id => "patronsearch").submit
end

When(/^jeg registrerer utlån av "(.*?)"/) do |book|
  #form = @browser.form(:id => "circ_search")
  #form.text_field(:id => "search-form").set(@context[:barcode])
  #form.submit
  form = @browser.form(:id => "mainform")
  form.text_field(:id => "barcode").set(@context[:barcode])
  form.submit
end

Then(/^registrerer systemet at "(.*?)" er utlånt$/) do |book|
  pending # express the regexp above with the code you wish you had
end

Then(/^at "(.*?)" låner "(.*?)"$/) do |name, book|
  pending # express the regexp above with the code you wish you had
end