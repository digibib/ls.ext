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

When(/^jeg går til innstillinger$/) do
 @browser.element(data_automation_id: 'tabs').element(text: 'Innstillinger').click
end

When(/^slår på alle avkrysningsboksene inne på innstillinger$/) do
  @browser.checkboxes(data_automation_id: /^UserSettings_/).each do |checkbox|
    CheckboxHelper.new(@browser).set(checkbox.attribute_value('data-automation-id'))
  end
end

When(/^jeg trykker lagre inne på innstillinger$/) do
  @browser.element(data_automation_id: 'UserSettings_saveButton').click
end

When(/^skal alle avkrysningsboksene være skrudd på inne på innstillinger$/) do
  wait_for { @browser.checkboxes(data_automation_id: /^UserSettings_/).size > 0 }
  @browser.checkboxes(data_automation_id: /^UserSettings_/).each do |checkbox|
    checkbox.set?.should eq true
  end
end

When(/^jeg skrur av alle avkrysningsnboksene inne på innstillinger$/) do
  @browser.checkboxes(data_automation_id: /^UserSettings_/).each do |checkbox|
    CheckboxHelper.new(@browser).set(checkbox.attribute_value('data-automation-id'), false)
  end
end

When(/^skal ingen av avkrysningsboksene være skrudd på inne på innstillinger$/) do
  wait_for { @browser.checkboxes(data_automation_id: /^UserSettings_/).size > 0 }
  @browser.checkboxes(data_automation_id: /^UserSettings_/).each do |checkbox|
    checkbox.set?.should eq false
  end
end

Given(/^at det finnes en person som ikke er låner$/) do
  step "at jeg har mottatt opplysninger om en låner"
end

When(/^jeg trykker på logg inn$/) do
  @browser.element(data_automation_id: 'login_element').click
end

When(/^jeg trykker på registreringslenken$/) do
  @browser.element(data_automation_id: 'registration_link').click
end

When(/^skal jeg se registreringsskjemaet$/) do
  @site.PatronClientCommon.registration_modal_visible?.should eq true
end

When(/^jeg legger inn mine personalia$/) do
  @browser.text_field(id: 'firstname').set generateRandomString
  @browser.text_field(id: 'lastname').set @active[:patron].surname
  @browser.text_field(id: 'day').set '%02d' % (rand(29)+1)
  @browser.text_field(id: 'month').set '%02d' % (rand(11)+1)
  @browser.text_field(id: 'year').set "19#{rand(100)}"
  @browser.text_field(id: 'ssn').set '%011d' % rand(10**11)
end

When(/^jeg trykker på knappen for å sjekke om jeg er registrert fra før$/) do
  wait_for { @browser.element(data_automation_id: 'check_existing_user_button').enabled? }
  @browser.element(data_automation_id: 'check_existing_user_button').click
end

Then(/^får jeg vite at jeg ikke er registrert fra før$/) do
  wait_for { @browser.element(data_automation_id: 'check_for_existing_user_success').present? }
end

When(/^jeg fyller inn resten av skjemaet$/) do
  @browser.text_field(id: 'email').set @active[:patron].email
  @browser.text_field(id: 'mobile').set '%08d' % rand(10**8)
  @browser.text_field(id: 'address').set generateRandomString
  @browser.text_field(id: 'zipcode').set '%04d' % rand(10000)
  @browser.text_field(id: 'city').set generateRandomString
  @browser.text_field(id: 'country').set generateRandomString
  @browser.select_list(data_automation_id: 'gender_selection').select_value 'female'
  @browser.text_field(data_automation_id: 'choose_pin').set '1234'
  @browser.text_field(data_automation_id: 'repeat_pin').set '1234'
end

When(/^jeg godtar lånerreglementet$/) do
  @browser.input(data_automation_id: 'accept_terms').set
end

When(/^jeg trykker på registreringsknappen$/) do
  wait_for { @browser.element(data_automation_id: 'register_button').enabled? }
  @browser.element(data_automation_id: 'register_button').click
end

Then(/^får jeg tilbakemelding om at registreringen er godkjent$/) do
  wait_for { @browser.element(data_automation_id: 'registration_success_modal').present? }
end

Then(/^jeg har fått et midlertidig brukernavn$/) do
  @active[:patron].userid = @browser.element(data_automation_id: 'username').text
  @active[:patron].userid.should_not be_empty
end

Then(/^jeg kan søkes opp i systemet som låner$/) do
  @site.Patrons.visit.search @active[:patron].surname
  @browser.div(class: 'patroninfo').text.should include(@active[:patron].surname)
end
