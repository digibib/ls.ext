# encoding: UTF-8

Then(/^kommer jeg til verks\-siden for det aktuelle verket$/) do
  Watir::Wait.until(BROWSER_WAIT_TIMEOUT) { @browser.h2(:data_automation_id => /work_title/).present? }
  @site.PatronClientWorkPage.getTitle.should include(@context[:work_title])
end


When(/^jeg er på sida til verket$/) do
  identifier = @context[:identifier].sub(services(:work).to_s + "/","")
  @site.PatronClientWorkPage.visit(identifier)
end

Then(/^ordet "(.*?)" som førsteutgave vises IKKE på verks\-siden$/) do |arg1|
  step "jeg er på sida til verket"
  @site.PatronClientWorkPage.getDate().should_not include(@context[:year])
end

Then(/^verkets årstall førsteutgave av vises på verks\-siden$/) do
  step "jeg er på sida til verket"
  @browser.refresh
  @site.PatronClientWorkPage.getDate().should eq(@context[:year])
end


Then(/^språket til verkets tittel vises på verks\-siden$/) do
  step "jeg er på sida til verket"
  @browser.refresh
  @site.PatronClientWorkPage.getTitle.should include("@" + @context[:work_title_lang])
end

Then(/^ser jeg informasjon om verkets tittel og utgivelsesår$/) do
  Watir::Wait.until(BROWSER_WAIT_TIMEOUT) {@site.PatronClientWorkPage.getTitle != ""}
  @site.PatronClientWorkPage.getTitle.should include(@context[:work_title])
  @site.PatronClientWorkPage.getDate.should include(@context[:year])
end

Then(/^verkets tittel vises på verks\-siden$/) do
  step "jeg er på sida til verket"
  @site.PatronClientWorkPage.getTitle.should include(@context[:work_title])
end

Then(/^verkets alternative tittel vises på verks\-siden$/) do
  step "jeg er på sida til verket"
  @browser.refresh
  @site.PatronClientWorkPage.getTitle.should include(@context[:alt_title])
end

Then(/^vises eksemplaret på verkssiden$/) do
  page = @site.PatronClientWorkPage.visit(@context[:identifier].split("/").last)
  page.existsExemplar.should be(true)
end

When(/^vises opplysningene om utgivelsen på verkssiden$/) do
  step "jeg er på sida til verket"
  @site.PatronClientWorkPage.getPublicationsTableRows().each do |row|
    row.td(:data_automation_id => "publication_title").text.should eq(@context[:publication_title])
    row.td(:data_automation_id => "publication_format").text.should eq(@context[:publication_format])
    row.td(:data_automation_id => "publication_language").text.should eq(@context[:publication_language])
  end
end

Then(/^ser jeg en liste over eksemplarer knyttet til verket$/) do
  @browser.refresh
  @site.PatronClientWorkPage.existsExemplar().should == true
end

Then(/^har eksemplarene en identifikator \(strekkode\)$/) do
  @site.PatronClientWorkPage.getItemsTableRows().each do |row|
    row.td(:data_automation_id => "item_barcode").text.should_not be_empty
  end
end

Then(/^eksemplarene er gruppert etter utgave m\/informasjon om format og språk$/) do
  @site.PatronClientWorkPage.getPublicationsTableRows().each do |row|
    row.td(:data_automation_id => "publication_title").text.should_not be_empty
    row.td(:data_automation_id => "publication_language").text.should_not be_empty
    row.td(:data_automation_id => "publication_format").text.should_not be_empty
  end

  @site.PatronClientWorkPage.getItemsTableRows().each do |row|
    row.td(:data_automation_id => "item_title").text.should_not be_empty
    row.td(:data_automation_id => "item_language").text.should_not be_empty
    row.td(:data_automation_id => "item_format").text.should_not be_empty
    row.td(:data_automation_id => "item_barcode").text.should_not be_empty
    row.td(:data_automation_id => "item_location").text.should_not be_empty
    row.td(:data_automation_id => "item_status").text.should_not be_empty
  end
end

Then(/^ser jeg format og språk for utgivelsen$/) do
  step "vises opplysningene om utgivelsen på verkssiden"
end

When(/^ser jeg eksemplarene gruppert etter utgave m\/informasjon om format og språk$/) do
  pending # Write code here that turns the phrase above into concrete actions
end

Then(/^ser jeg lokasjon og oppstillinga av eksemplaret$/) do
  @site.PatronClientWorkPage.getItemsTableRows().each do |row|
    row.td(:data_automation_id => "item_location").text.should_not be_empty
    row.td(:data_automation_id => "item_shelfmark").text.should_not be_empty
  end
end

Then(/^ser jeg at eksemplaret er ledig$/) do
  @site.PatronClientWorkPage.getItemsTableRows().each do |row|
    row.td(:data_automation_id => "item_status").text.should eq("Ledig")
  end
end

Then(/^ser jeg at eksemplaret ikke er ledig$/) do
  @site.PatronClientWorkPage.getItemsTableRows().each do |row|
    row.td(:data_automation_id => "item_status").text.should match(/Forventet [0-9]{4}-[0-9]{2}-[0-9]{2}/)
  end
end

When(/^jeg låner \"(.*?)\" ut til \"(.*?)$/) do |barcode, patron|
  @site.SelectBranch.visit.select_branch()
  step "jeg registrerer \"Knut\" som aktiv låner"
  @site.Checkout.checkout(barcode)

  @active[:item] = barcode
  @cleanup.push( "utlån #{barcode}" =>
    lambda do
      @site.Home.visit.select_branch().checkin(barcode)
    end
  )
end

Given(/^at eksemplaret er utlånt til en låner$/) do
  step "at det finnes en låner"
  step "jeg låner \"#{@context[:item_barcode]}\" ut til \"#{@active[:patron]}\""
end


When(/^kan klikke på det første verket$/) do
  @site.SearchPatronClient.follow_first_item_in_search_result
end


When(/^vises forfatterens navn på verkssiden$/) do
  step "jeg er på sida til verket"
  @browser.refresh
  @site.PatronClientWorkPage.getAuthor.should include(@context[:personName])
end
