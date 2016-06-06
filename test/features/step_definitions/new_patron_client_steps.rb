require 'cgi'

When(/^at jeg er i søkegrensesnittet$/) do
  @site.SearchPatronClient.visit
end

When(/^jeg søker på "([^"]*)" \(\+ id på vilkårlig migrering\)$/) do |query|
  @site.SearchPatronClient.search_with_text "#{query}#{@context[:random_migrate_id]}"
end

When(/^skal jeg få "([^"]*)" treff$/) do |hits|
  wait_retry { @site.SearchPatronClient.total_hits.eql? hits }
end

When(/^jeg går til side "([^"]*)" i resultatlisten$/) do |page|
  @site.SearchPatronClient.goto_search_result_page page
end

When(/^skal jeg ha "([^"]*)" resultater og være på side "([^"]*)"$/) do |hits, page|
  wait_retry { @browser.element(class: 'pagination').a(text: page).parent.class_name.eql? 'active' }
  wait_retry { @browser.element(data_automation_id: 'hits-total').exists? }
  wait_retry { @browser.div(data_automation_id: 'search-result-entries').elements(:xpath, '*').count.to_s.eql? hits }
end

When(/^jeg trykker tilbake i nettleseren$/) do
  sleep 1 # Avoids snags in PhantomJS
  @browser.back
end

When(/^jeg trykker fremover i nettleseren$/) do
  sleep 1 # Avoids snags in PhantomJS
  @browser.forward
end

When(/^jeg trykker oppfrisk i nettleseren$/) do
  @browser.refresh
end

When(/^skal jeg se filtre på format, språk og målgruppe$/) do
  wait_retry { @browser.element(data_automation_id: 'filter_format').exists? }
  wait_retry { @browser.element(data_automation_id: 'filter_language').exists? }
  wait_retry { @browser.element(data_automation_id: 'filter_audience').exists? }
end

When(/^jeg slår på et filter for et vilkårlig format$/) do
  # To get nice styling for checkboxes, they are effectively set to invisible while images are displayed in their place.
  # Watir does not allow interaction with invisible items, therefore clicking the parent (which has the click handler)
  @browser.element(data_automation_id: 'filter_format').checkboxes.to_a.select { |checkbox| not checkbox.set? }.sample.parent.click
end

When(/^skal jeg kun se treff med valgte format tilgjengelig$/) do
  wait_for { @browser.element(data_automation_id: 'filter_format').present? }
  filter_values = @browser.element(data_automation_id: 'filter_format').lis
                      .select { |li| li.checkbox.set? }
                      .map { |li| li.element(data_automation_id: 'filter_label').text }
  wait_retry {
    match = false
    @site.SearchPatronClient.get_search_result_list.each do |element|
      filter_values.each do |filter_value|
        if element.attribute_value('data-formats').include? filter_value
          match = true
        end
      end
    end
    match
  }
end

When(/^skal filterne være valgt i grensesnittet$/) do
  filters = CGI::parse(URI(@browser.url).query).select { |param| param.start_with? 'filter_' }
  data_automation_ids = filters.map { |aggregation, buckets| buckets.map { |bucket| "#{aggregation}_#{bucket}" } }.flatten
  filters.each do |filter, _|
    element = @browser.element(data_automation_id: filter)
    element.lis.select do |filter|
      if data_automation_ids.include? filter.attribute_value(:data_automation_id)
        filter.checkbox.set?.should eq true
      end
    end
  end
end

When(/^nåværende søketerm skal være "([^"]*)" \(\+ id på vilkårlig migrering\)$/) do |query|
  @site.SearchPatronClient.search_term.eql?("#{query}#{@context[:random_migrate_id]}")
end

When(/^skal tittel prefikset "([^"]*)" og som inneholder "([^"]*)" vises i søkeresultatet$/) do |prefix, str|
  wait_retry {
    element = @browser.element(data_automation_id: 'work-title')
    element.present? && element.text.eql?("#{prefix}#{@context[:random_migrate_id]} #{@context[:random_migrate_id]}#{str}")
  }
end

When(/^skal språket "([^"]*)" være valgt$/) do |language|
  @site.PatronClientCommon.current_language?(language).should eq true
end

When(/^søkeknappen skal vise ordet "([^"]*)"$/) do |button_text|
  wait_retry { @browser.element(data_automation_id: 'search_button').text.eql? button_text }
end

When(/^jeg søker på "([^"]*)"$/) do |query|
  @site.SearchPatronClient.search_with_text "#{query}"
end

When(/^jeg trykker på første treff$/) do
  @site.SearchPatronClient.follow_first_item_in_search_result
end

When(/^skal jeg se "([^"]*)" utgivelser$/) do |count|
  wait_retry { @site.PatronClientWorkPage.publication_entries.size.to_s.eql? count }
end

When(/^skal jeg se et panel med informasjon om utgivelsen$/) do
  wait_retry { @browser.elements(data_automation_id: /^publication_info_/).size.eql? 1 } #There should only be one
end

When(/^jeg trykker på utgivelsen med "([^"]*)" språk$/) do |language|
  @browser.elements(data_automation_id: 'publication_languages').select { |element| element.text.include? language }[0].click
end

When(/^den skal inneholde eksemplarinformasjonen$/) do |table|
  table = table.hashes.sort_by { |r| r.to_s }
  table.each do |row|
    if row['Filial'].eql? 'random_migrate_branchcode'
      row['Filial'] = @context[:random_migrate_branchcode]
    end
  end
  wait_retry { @browser.element(data_automation_id: /^publication_info_/).present? }
  publication_info = @browser.element(data_automation_id: /^publication_info_/).table.hashes.sort_by { |r| r.to_s }
  table.should eq publication_info
end

When(/^skal jeg ikke se et panel med informasjon om utgivelsen$/) do
  wait_retry { @browser.elements(data_automation_id: /^publication_info_/).size.eql? 0 }
end

When(/^skal skal tittel prefikset "([^"]*)" og som inneholder "([^"]*)" vises på verkssiden$/) do |prefix, str|
  @site.PatronClientWorkPage.title.eql?("#{prefix}#{@context[:random_migrate_id]} #{@context[:random_migrate_id]}#{str}")
end

When(/^jeg trykker på krysset i boksen med utgivelsesinformasjon$/) do
  @browser.element(data_automation_id: /^close_publication_info_/).click
end

When(/^jeg går til Min Side$/) do
  @site.PatronClientProfilePage.visit
end

When(/^skal jeg se innloggingsvinduet$/) do
  @site.PatronClientCommon.login_modal_visible?.should eq true
end

When(/^jeg logger inn$/) do
  @site.PatronClientCommon.login(@active[:patron].userid, @active[:patron].password)
end

When(/^skal jeg se informasjonen min$/) do
  @site.PatronClientProfilePage.borrowernumber.should eq @active[:patron].borrowernumber
end

When(/^låneren trykker bestill på en utgivelse$/) do
  record_id = @site.PatronClientWorkPage.click_first_reserve
  @context[:reserve_record_id] = record_id
end

When(/^skal jeg se reservasjonsvinduet$/) do
  wait_for { @site.PatronClientCommon.reservation_modal_visible? }
end

When(/^jeg trykker på bestill$/) do
  @browser.element(data_automation_id: 'reserve_button').click
end

When(/^får låneren tilbakemelding om at boka er reservert$/) do
  wait_for { @site.PatronClientCommon.reservation_success_modal_visible? }
end

When(/^jeg trykker for å bytte språk$/) do
  @site.PatronClientCommon.click_change_language
end

When(/^jeg velger riktig avdeling$/) do
  # Temporary hack to set the branch code to the test branch
  # Will be fixed when Patron Client can retrieve a list of existing branches from Koha
  @browser.execute_script("document.querySelector('[data-automation-id=\"reservation_modal\"]').getElementsByTagName('option')[0].setAttribute('value', \"#{@context[:random_migrate_branchcode]}\")")
end

When(/^jeg går til Lån og reservasjoner på Min Side$/) do
  @browser.goto(patron_client(:loansAndReservations))
end

When(/^skal jeg se reservasjonen$/) do
  wait_retry {
    reservations = @site.PatronClientLoansAndReservationsPage.reservations
    reservations.size.eql?(1) && reservations.first.attribute_value('data-recordid').eql?(@context[:reserve_record_id])
  }
end

When(/^jeg trykker på personopplysninger$/) do
  @browser.element(data_automation_id: 'tabs').element(:text, 'Personopplysninger').click
end

When(/^skal jeg se at boka er klar til å hentes$/) do
  wait_retry {
    pickups = @site.PatronClientLoansAndReservationsPage.pickups
    pickups.size.eql?(1) && pickups.first.attribute_value('data-recordid').eql?(@context[:reserve_record_id])
  }
end

When(/^det skal ikke være bøker klare til avhenging eller i historikk$/) do
  @site.PatronClientLoansAndReservationsPage.loans.size.should eq 0
  @site.PatronClientLoansAndReservationsPage.pickups.size.should eq 0
end

When(/^skal jeg se at boka er utlånt$/) do
  wait_retry {
    loans = @site.PatronClientLoansAndReservationsPage.loans
    loans.size.eql?(1) && loans.first.attribute_value('data-recordid').eql?(@context[:reserve_record_id])
  }
end

When(/^jeg trykker på forleng lånet$/) do
  @context[:reserve_due_date] = @browser.element(data_automation_id: 'UserLoans_loan_dueDate').text
  @site.PatronClientLoansAndReservationsPage.loans.first.button.click
  wait_for { @browser.element(data_automation_id: 'extend_loan_modal').present? }
end

When(/^jeg bekrefter at jeg skal forlenge lånet$/) do
  @browser.element(data_automation_id: 'confirm_button').click
  wait_for { @browser.element(data_automation_id: 'extend_loan_success_modal').present? }
  @browser.element(data_automation_id: 'extend_loan_success_modal').button.click
  wait_for { not @browser.element(data_automation_id: 'extend_loan_success_modal').present? }
end

When(/^skal jeg se en dato lenger frem i tid$/) do
  wait_for { Date.parse(@browser.element(data_automation_id: 'UserLoans_loan_dueDate').text) > Date.parse(@context[:reserve_due_date]) }
end

When(/^jeg trykker på avbestill reservasjon$/) do
  @site.PatronClientLoansAndReservationsPage.reservations.first.button.click
  wait_for { @browser.element(data_automation_id: 'cancel_reservation_modal').present? }
end

When(/^jeg bekrefter at jeg skal avbestille reservasjonen$/) do
  @browser.element(data_automation_id: 'confirm_button').click
  wait_for { @browser.element(data_automation_id: 'cancel_reservation_success_modal').present? }
  @browser.element(data_automation_id: 'cancel_reservation_success_modal').button.click
  wait_for { not @browser.element(data_automation_id: 'cancel_reservation_success_modal').present? }
end

When(/^skal jeg ikke ha noen reservasjoner$/) do
  wait_for { @site.PatronClientLoansAndReservationsPage.reservations.size.eql? 0 }
end