# encoding: UTF-8

Given(/^at jeg er på side for materialtypeadministrasjon i administrasjonsgrensesnittet$/) do
  @browser.goto intranet(:item_types)
  @browser.select_list(:name => "table_item_type_length").select "All"
end

Then(/^ser jeg at følgende materialtyper er tilgjengelig$/) do |table|
  d = @browser.table :id => 'table_item_type'
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

Given(/^at tingen finnes i biblioteket$/) do
  step "at boka finnes i biblioteket"
end

When(/^jeg leter opp en ting i katalogiseringssøk$/) do
  step "jeg leter opp boka i katalogiseringssøk"
end

Then(/^kan jeg velge å endre materialtypen til "(.*?)"$/) do |type|
  step "velger å redigere eksemplaret"
  s = @browser.select_list(:id => /^tag_952_subfield_y_[0-9]+$/)
  s.select "#{type}"
end
