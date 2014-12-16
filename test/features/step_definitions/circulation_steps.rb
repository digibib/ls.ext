# encoding: UTF-8

require 'pp'
Given(/^at en bok er utlånt til en låner$/) do
  step "jeg registrerer \"Knut\" som aktiv låner"
  step "jeg registrerer utlån av boka"
end

#############################
# AUTOMATED CIRCULATION STEPS
#############################

Given(/^at det finnes en utlånsautomat$/) do
  pending # express the regexp above with the code you wish you had
end

When(/^låneren velger å låne på automaten$/) do
  pending # express the regexp above with the code you wish you had
end

When(/^låner identifiserer seg med gyldig lånekort$/) do
  pending # express the regexp above with the code you wish you had
end

When(/^låner taster riktig PIN$/) do
  pending # express the regexp above with the code you wish you had
end

Then(/^får låneren mulighet til å registrere lån på automaten$/) do
  pending # express the regexp above with the code you wish you had
end


When(/^jeg registrerer "(.*?)" som aktiv låner$/) do |patron|
  @browser.goto intranet(:home)
  @browser.text_field(:id => "findborrower").set "#{patron} #{@context[:surname]}"
  @browser.form(:id => "patronsearch").submit
end

When(/^jeg registrerer utlån av boka$/) do
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

When(/^boka blir registrert innlevert$/) do
  @browser.goto intranet(:select_branch)
  @browser.form(:action => "selectbranchprinter.pl").submit
  @browser.a(:href => "#checkin_search").click
  @browser.text_field(:id => "ret_barcode").set @context[:barcode]
  @browser.form(:action => "/cgi-bin/koha/circ/returns.pl").submit
end


Then(/^registrerer systemet at boka er utlånt$/) do
  @browser.goto intranet(:home)
  @browser.a(:text => "Search the catalog").click
  form = @browser.form(:id => "cat-search-block")
  form.text_field(:id => "search-form").set(@context[:book_title])
  form.submit
  @browser.text.should include(@context[:book_title])
end

Then(/^at "(.*?)" låner boka$/) do |name|
  @browser.text.should include(@context[:book_title])
  @browser.text.should include "Checked out to #{name}"
end

Then(/^viser systemet at låneren ikke låner boka$/) do
  @browser.goto intranet(:home)
  @browser.a(:text => "Search the catalog").click
  form = @browser.form(:id => "cat-search-block")
  form.text_field(:id => "search-form").set(@context[:book_title])
  form.submit
  @browser.text.should include(@context[:book_title])
  @browser.text.should_not include "Checked out to Knut"
end

Given(/^at status (.*?) er innstilt med data$/) do |status,table|
  @browser.goto intranet(:authorised_values)
  s = @browser.select_list :id => 'searchfield'
  s.select "#{status}"
  d = @browser.table :id => 'table_authorized_values'
  p = d.hashes
  #Need to remove &nbsp; from captured data values
  p.each { |x| 
    x.each {|k,v|
      if /^\s$/.match(v)
        x.update({ k => ""})
      end
    }
  }
  table.diff!(p)
end

When(/^jeg leter opp boka i katalogiseringssøk$/) do
  @browser.goto intranet(:cataloguing)
  @browser.text_field(:name => 'q').set @context[:book_title]
  @browser.form(:name => 'search').submit
  @browser.text.include?("Add/Edit items") == true
end

When(/^velger å redigere eksemplaret$/) do
  @browser.link(:text => 'Add/Edit items').click
  @browser.link(:text => 'Edit').click
end

When(/^jeg stiller status til "(.*?)"$/) do |status|
  def selector (subfield,status)
    s = @browser.select_list(:id => /^tag_952_subfield_#{subfield}_[0-9]+$/)
    s.select "#{status}" 
    @browser.button(:value => "Save changes").click
  end
  case status
  when "trukket tilbake"
    selector(0,status)
  when "borte i transport", "ikke på plass", "påstått ikke lånt", "påstått levert", "regnes som tapt", "retur eieravdeling (ved import)", "tapt", "tapt og erstattet", "tapt, regning betalt", "til henteavdeling (ved import)", "vidvanke, registrert forsvunnet"
    selector(1,status)
  when "skadet"
    selector(4,status)
  when "begrenset tilgang","referanseverk"
    selector(5,status)    
  when "i bestilling","ny","til innbinding","til internt bruk","til katalogisering","til retting","vurderes kassert"
    selector(7,status)
  end
end

Then(/^viser systemet at eksemplaret har status "(.*?)"$/) do |status|
  @browser.table(:id => "itemst").text.include?("#{status}").should == true
end

Given(/^at jeg er på sida for sirkulasjonsregler$/) do
  @browser.goto intranet(:circulation_rules)
end

Given(/^at sirkulasjonsreglene på sida stemmer overens med følgende data$/) do |table|
  table = table.raw()
  rows = @browser.table(:id => "default-circulation-rules").tbody.rows
  orig = []
  rows.each do |row| 
    orig << [row[0].text, row[1].text, row[2].text, row[3].text, row[4].text, row[5].text, row[6].text, row[7].text, row[8].text, row[9].text, row[10].text, row[11].text, row[12].text, row[13].text, row[14].text, row[15].text, row[16].text ]
  end
  orig.pop
  a = (table & orig == table)
  b = (orig & table == orig)

  a.should == true
  b.should == true

end


