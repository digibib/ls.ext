Given(/^at jeg har en (bok|CD)$/) do |media_type|
  true
end

When(/^debugger jeg$/) do
  sleep(1)
end

When(/^avbryter jeg$/) do
  fail 'Aborting'
end

When(/^jeg venter litt$/) do
  sleep 2
  @browser.execute_script("console.log('waiting...')")
  if @browser.div(:id => 'ui-blocker').exists?
    puts("blocker")
  end
  if @browser.div(:id => 'ui-blocker').exists? && @browser.div(:id => 'ui-blocker').visible?
    sleep 4
  end
end

When(/^at det finnes et verk med (forfatter|komponist)$/) do |createor_type|
  step "at jeg er i personregistergrensesnittet"
  step "leverer systemet en ny ID for den nye personen"
  step "jeg kan legge inn navn fødselsår og dødsår for personen"
  step "jeg kan legge inn nasjonalitet for personen"
  @site.RegWork.visit
  step "leverer systemet en ny ID for det nye verket"
  step "jeg søker på navn til opphavsperson for det nye verket"
  step "velger person fra en treffliste"
  step "jeg kan legge til tittel for det nye verket"
  step "jeg kan legge til undertittel for det nye verket"
  step "jeg legger til et årstall for førsteutgave av nye verket"
  step "jeg kan legge til språk for det nye verket"
  step "grensesnittet viser at endringene er lagret"
end

def add_creator_name
  creator_name_field = @browser.elements(:xpath => "//span[@data-automation-id='Contribution_http://data.deichman.no/ontology#agent_0']//input|//span[@data-automation-id='Contribution_http://data.deichman.no/ontology#agent_0']//span[@contenteditable]").find(&:visible?)
  creator_name_field.click
  creator_name_field.send_keys (@context[:person_name])
  creator_name_field.send_keys :enter
end

When(/^jeg legger inn forfatternavnet på startsida$/) do
  @site.WorkFlow.visit
  add_creator_name
end

When(/^jeg legger inn komponistnavnet på startsida$/) do
  @site.WorkFlow.visit_for_music
  add_creator_name
end


def contains_class(class_name)
  "contains(concat(' ',normalize-space(@class),' '),' #{class_name} ')"
end

When(/^velger jeg (en|et) (person|organisasjon|utgivelse|utgiver|serie|emne|sjanger|hendelse|sted|verk) fra treffliste fra (person|organisasjons|utgivelses|utgiver|sted|serie|emne|sjanger|hendelses|steds|verks)indeksen$/) do |art, type_1, type_2|
  Watir::Wait.until(timeout: BROWSER_WAIT_TIMEOUT*5) {
    @browser.element(:xpath => "//span[#{contains_class('edit-resource')}]|//span[#{contains_class('select-result-item')}]").present?
  }
  if @browser.span(:class => 'edit-resource').present?
    @browser.execute_script("window.onbeforeunload = function() {};")
    @browser.spans(:class => 'edit-resource').first.click
  end
  if @browser.span(:class => "select-result-item").present?
    @browser.spans(:class => "select-result-item").first.click
  end
end

When(/^velger jeg (en|et) (person|organisasjon|utgivelse|utgiver|serie|emne|sjanger|hendelse|sted|verksserie) fra treffliste fra (person|organisasjons|utgivelses|utgiver|sted|serie|emne|sjanger|hendelses|steds|verksserie)registeret$/) do |art, type_1, type_2|
  Watir::Wait.until(timeout: BROWSER_WAIT_TIMEOUT*5) {
    @browser.div(:class => 'exact-match').present?
  }
  @browser.div(:class => 'exact-match').scroll.to
  @browser.div(:class => 'exact-match').spans(:class => /select-result-item|edit-resource/).first.fire_event('click')
end

When(/^velger verket fra lista tilkoplet forfatteren$/) do
  wait_for {
    @browser.div(:class => 'exact-match').a(:class => "toggle-show-sub-items").present?
  }
  toggle_show_subitems = @browser.div(:class => 'exact-match').a(:class => "toggle-show-sub-items")
  toggle_show_subitems.scroll.to
  toggle_show_subitems.click
  sleep 1
  @browser.inputs(:class => "select-work-radio").find(&:visible?).click
end

When(/^verifiserer at verkets basisopplysninger uten endringer er korrekte$/) do
  @browser.text_field(:data_automation_id => "Work_http://data.deichman.no/ontology#mainTitle_0").value.should eq @context[:work_maintitle]
end

When(/^verifiserer verkets tilleggsopplysninger uten endringer er korrekte$/) do
  @browser.select(:data_automation_id => "Work_http://data.deichman.no/ontology#language_0").selected_options.include? @context[:work_language]
end

When(/^legger inn opplysningene om (CD-|)utgivelsen$/) do |media_type|
  if media_type == ''
    media_type = 'Bok'
  end
  # TODO: Unify add_prop and select_prop in the page objects to avoid having to specify it.
  data = Hash.new
  data['publicationYear'] = [(1000 + rand(1015)).to_s, :add_prop]
  data['format'] = [:random, :select_prop]
  data['language'] = [:random, :select_prop]
  data['partTitle'] = [generateRandomString, :add_prop]
  data['variantTitle'] = [generateRandomString, :add_prop]
  data['partNumber'] = [generateRandomString, :add_prop]
  data['edition'] = [generateRandomString, :add_prop]
  if media_type == 'Bok'
    data['numberOfPages'] = [rand(999).to_s, :add_prop]
    data['isbn'] = [generateRandomString, :add_prop]
    data['illustrativeMatter'] = [:random, :select_prop]
    data['hasFormatAdaptation'] = [:random, :select_prop]
    data['binding'] = [:random, :select_prop]
    data['writingSystem'] = [:first, :select_prop]
  end

  workflow_batch_add_props 'Publication', data
end

def workflow_batch_add_props(domain, data)
  data.each do |fragment, (value, method)|
    begin
      predicate = "http://data.deichman.no/ontology##{fragment}"
      textualValue = value;
      if value.eql?(:random) && method.eql?(:select_prop)
        choices = @site.WorkFlow.get_available_select_choices(domain, predicate)
        sampleNr = rand([choices.length, 5].min)
        value = choices[sampleNr].value
        textualValue = choices[sampleNr].text
      end
      if value.eql?(:first) && method.eql?(:select_prop)
        first = @site.WorkFlow.get_available_select_choices(domain, predicate).first
        value = first.value
        textualValue = first.text
      end
      symbol = "#{domain.downcase}_#{fragment.downcase}".to_sym # e.g. :publication_format
      label_symbol = "#{domain.downcase}_#{fragment.downcase}_label".to_sym # e.g. :publication_format
      @context[symbol] = value
      @context[label_symbol] = textualValue
      @site.WorkFlow.method(method).call(domain, predicate, textualValue, 0, true)
      # rescue
      #   fail "Error adding #{fragment} for #{domain}"
    end
  end
end

When(/^bekrefter at utgivelsesinformasjonen er korrekt$/) do
  @site.PatronClientWorkPage.visit(@context[:work_identifier].split("/").last)
  step "ser jeg informasjon om verkets tittel og utgivelsesår"
end

When(/^legger inn basisopplysningene om verket for hovedtittel og undertittel$/) do
  data = Hash.new
  data['mainTitle'] = [generateRandomString, :add_prop]
  data['subtitle'] = [generateRandomString, :add_prop]

  workflow_batch_add_props 'Work', data
end

When(/^legger inn tilleggsopplyningene om verket for utgivelsesår og språk$/) do
  data = Hash.new
  data['publicationYear'] = [rand(2015).to_s, :add_prop]
  data['language'] = [['Norsk', 'Svensk', 'Dansk'].sample, :select_prop]

  workflow_batch_add_props 'Work', data
end

def save_value_for_later(input, parameter_label, value)
  input_id = input.attribute_value('data-automation-id')
  if (input_id)
    predicate = input_id.sub(/^([a-zA-Z]*)_/, '').sub(/_[0-9]+$/, '')
    domain = input_id.match(/^([a-zA-Z]*)_.*/).captures[0]
    @context[parameter_label] = value
    return domain, predicate
  end
end

When(/^jeg skriver verdien "([^"]*)" for "([^"]*)"$/) do |value, parameter_label|
  input = @browser.inputs(:xpath => "//*[preceding-sibling::*/@data-uri-escaped-label = '#{URI::escape(parameter_label)}']//*[self::textarea or self::input]").find(&:visible?)
  domain, predicate = save_value_for_later(input, parameter_label, value)
  @site.WorkFlow.add_prop(domain, predicate, value)
end

When(/^jeg skriver i feltet "([^"]*)" teksten$/) do |parameter_label, value|
  input = @browser.inputs(:xpath => "//*[preceding-sibling::*/@data-uri-escaped-label = '#{URI::escape(parameter_label)}']//*[self::textarea or self::input]").find(&:visible?)
  domain, predicate = save_value_for_later(input, parameter_label, value)
  @site.WorkFlow.add_prop(domain, predicate, value, 0, true)
end

def predicate_from_automation_id(select_id)
  select_id.sub(/^(Work|Publication|Person|WorkRelation)_/, '').sub(/_[0-9]+$/, '')
end

def domain_of_automation_id(select_id)
  select_id.match(/^(Work|Publication|Person|WorkRelation)_.*/).captures[0]
end

def do_select_value(selectable_parameter_label, value)
  select = @browser.selects(:xpath => "//*[preceding-sibling::*/@data-uri-escaped-label='#{URI::escape(selectable_parameter_label)}']//select")[0]
  wait_for {select.present?}
  select_id = select.attribute_value('data-automation-id')
  predicate = predicate_from_automation_id(select_id)
  domain = domain_of_automation_id(select_id)
  @site.WorkFlow.select_prop(domain, predicate, value)
  fragment = predicate.partition('#').last()
  "#{domain.downcase}_#{fragment.downcase}".to_sym
end

When(/^jeg velger verdien "([^"]*)" for "([^"]*)"$/) do |value, selectable_parameter_label|
  do_select_value(selectable_parameter_label, value)
  @context[selectable_parameter_label] = value
end

When(/^jeg velger verdien "([^"]*)" for "([^"]*)", som i gammelt grensesnitt heter "([^"]*)"$/) do |value, selectable_parameter_label, old_label|
  do_select_value(selectable_parameter_label, value)
  @context[selectable_parameter_label] = value
  @context[old_label] = @context[selectable_parameter_label]
end

When(/^jeg velger verdiene "([^"]*)" og "([^"]*)" for "([^"]*)"$/) do |value_1, value_2, selectable_parameter_label|
  do_select_value(selectable_parameter_label, value_1)
  do_select_value(selectable_parameter_label, value_2)
  @context[selectable_parameter_label] = [value_1, value_2]
end

When(/^jeg følger lenken til posten i Koha i arbeidsflyten$/) do
  link = @browser.a(:data_automation_id => 'biblio_record_link').href
  steps 'at jeg er logget inn som superbruker'
  @browser.goto(link)
end

When(/^tar jeg en liten pause$/) do
  sleep(1)
end

When(/^at jeg skriver inn sted i feltet for utgivelsessted og trykker enter$/) do
  data_automation_id = "Publication_http://data.deichman.no/ontology#hasPlaceOfPublication_0"
  publication_place_field = @browser.element(:xpath => "//span[@data-automation-id='#{data_automation_id}']//input[@type='search']|//span[@data-automation-id='#{data_automation_id}']//span[@contenteditable]")
  publication_place_field.scroll.to
  publication_place_field.click
  publication_place_field.send_keys @context[:placeofpublication_place]
  publication_place_field.send_keys :enter
end

When(/^at jeg skriver inn (tilfeldig |)([a-z]*) i feltet "([^"]*)" og trykker enter$/) do |is_random, concept, label|
  field = @site.WorkFlow.get_text_field_from_label(label)
  field.scroll.to
  field.click
  if is_random == 'tilfeldig '
    @context[("random_#{@site.translate(concept)}_name").to_sym] = generateRandomString
    field.send_keys (@context[("random_#{@site.translate(concept)}_name").to_sym])
  else
    field.send_keys (@context[("#{@site.translate(concept)}_name").to_sym])
  end
  field.send_keys :enter
end

When(/^at jeg skriver inn person nr ([0-9]) i feltet "([^"]*)" og trykker enter$/) do |index, label|
  # TODO: remove @context[:random_migrate_person_names][index.to_i]
  person = @context[:services].persons[index.to_i-1]
  personName = @context[:services].get_value(person, 'name')
  field = @site.WorkFlow.get_text_field_from_label(label)
  field.click
  field.send_keys (personName)
  field.send_keys :enter
end

When(/^at jeg skriver inn tittelen på verk nr ([0-9]) i feltet "([^"]*)" og trykker enter$/) do |index, label|
  # TODO: remove @context[:random_migrate_person_names][index.to_i]
  work = @context[:services].works[index.to_i-1]
  workTitle = @context[:services].get_value(work, 'mainTitle')
  field = @site.WorkFlow.get_text_field_from_label(label)
  field.scroll.to
  field.click
  field.send_keys (workTitle)
  field.send_keys :enter
end

When(/^skriver jeg inn samme (tilfeldige |)(.*) i feltet "([^"]*)" og trykker enter$/) do |is_random, concept, label|
  field = @site.WorkFlow.get_text_field_from_label(label)
  field.click
  field.double_click
  field.send_keys :backspace
  if (is_random == 'tilfeldige ')
    field.send_keys @context[("random_#{@site.translate(concept)}_name").to_sym]
  else
    field.send_keys @context[("#{@site.translate(concept)}_name").to_sym]
  end
  field.send_keys :enter
end

def select_first_in_open_dropdown
  @browser.elements(:xpath => "//span[@class='select2-results']/ul/li").first.click
end

When(/^velger jeg første (.*) i listen som dukker opp$/) do |concept|
  sleep 5
  select_first_in_open_dropdown
end

When(/^jeg legger inn navn på en person som skal knyttes til biinnførsel$/) do
  data_automation_id = "Contribution_http://data.deichman.no/ontology#agent_0"
  person_name_field = @browser.element(:xpath => "//span[@data-automation-id='#{data_automation_id}']//span[@contenteditable]")
  person_name_field.click
  person_name_field.send_keys @context[:person_name]
  person_name_field.send_keys :enter
end

When(/^trykker jeg på knappen for å avslutte$/) do
  @context[:publication_identifier] = @site.WorkFlow.get_publication_uri || @context[:publication_identifier]
  @site.WorkFlow.finish
end

When(/^velger radioknappen for "([^"]*)" for å velge "([^"]*)"$/) do |value, label|
  input = @browser.inputs(:xpath => "//input[@type='radio'][following-sibling::label='#{value}']")[0]
  input.click
end

When(/^jeg velger rollen "([^"]*)"$/) do |role_name|
  data_automation_id_1 = "Contribution_http://data.deichman.no/ontology#role_0"
  data_automation_id_2 = "PublicationPart_http://data.deichman.no/ontology#role_0"
  role_select_field = @browser.text_fields(:xpath => "//span[@data-automation-id='#{data_automation_id_1}' or @data-automation-id='#{data_automation_id_2}']//input[@type='search'][not(@disabled)]").find(&:visible?)
  role_select_field.click
  role_select_field.set(role_name)
  select_first_in_open_dropdown
  @context[:person_role] = role_name
end

When(/^trykker jeg på knappen for legge til biinnførselen$/) do
  add_button = @browser.elements(:xpath => "//*[@id='confirm-addedentry']//span[@class='subject-type-association']//*[text()='Legg til']").first
  add_button.scroll.to
  add_button.click
end

When(/^trykker jeg på knappen for legge til serieinformasjon$/) do
  @browser.elements(:xpath => "//*[@id='describe-publication']//*[text()='Legg til']").first.click
end

When(/^trykker jeg på knappen for legge til mer$/) do
  @browser.elements(:xpath => "//div[./div[@data-uri-escaped-label='Biinnf%C3%B8rsel']]//*[text()='Legg til ny']").first.click
end

When(/^sjekker jeg at det finnes en (bi|hoved)innførsel hvor (personen|organisasjonen) jeg valgte har rollen "([^"]*)" knyttet til "([^"]*)"$/) do |type, agent_type, role_name, association|
  data_automation_id_agent = "Contribution_http://data.deichman.no/ontology#agent_0"
  if agent_type == 'personen'
    name_line = "#{@context[:person_name]}, #{@context[:person_birthyear]}-#{@context[:person_deathyear]}"
  else
    name_line = "#{@context[:person_name]}"
  end
  name = @browser.span(:xpath => "//span[starts-with(normalize-space(), '#{name_line}')]")
  Watir::Wait.until(timeout: BROWSER_WAIT_TIMEOUT) {
    name.exists?
  }
  name.should exist
  data_automation_id_role = "Contribution_http://data.deichman.no/ontology#role_0"
  role_span = @browser.span(:xpath => "//span[@data-automation-id='#{data_automation_id_role}']//span[normalize-space()='#{@site.translate(role_name)}']")
  role_span.should exist

  @browser.span(:xpath => "//span[@class='subject-type-association'][./span[text()='#{association}']]").should exist
end

When(/^sjekker jeg at det er "([^"]*)" biinnførsler totalt$/) do |number_of_additional_entries|
  @browser.divs(:xpath => "//span[./preceding-sibling::*[@data-uri-escaped-label='Biinnf%C3%B8rsel']]//span[contains(concat(' ',normalize-space(@class),' '), ' subject-type-association ')]").length.should equal(number_of_additional_entries.to_i)
end

When(/^sjekker jeg at det er "([^"]*)" biinnførsler på venstre side$/) do |number_of_additional_entries|
  @browser.divs(:xpath => "//span[@class='height-aligned']/span[1]//*[./preceding-sibling::*[@data-uri-escaped-label='Biinnf%C3%B8rsel']]//span[contains(concat(' ',normalize-space(@class),' '), ' subject-type-association ')]").length.should equal(number_of_additional_entries.to_i)
end

When(/^fjerner jeg den første biinførselen$/) do
  @browser.as(:xpath => "//*[@id='confirm-addedentry']//a[@class='delete']").first.click
end

When(/^fjerner jeg hovedinnførselen$/) do
  @browser.as(:xpath => "//*[@id='confirm-person']//a[@class='delete']").first.click
end

When(/^at jeg skriver inn serie i feltet for serie og trykker enter$/) do
  data_automation_id = "SerialIssue_http://data.deichman.no/ontology#serial_0"
  serial_field = @browser.text_field(:xpath => "//span[@data-automation-id='#{data_automation_id}']//input[@type='search']")
  serial_field.click
  serial_field.set(@context[:serial_name])
  serial_field.send_keys :enter

end

When(/^jeg kan legge inn seriens navn$/) do
  @context[:serial_name] = generateRandomString
  @site.RegSerial.add_prop("http://data.deichman.no/ontology#mainTitle", @context[:serial_name])
end

When(/^jeg kan legge inn verksseriens navn$/) do
  @context[:work_series_name] = generateRandomString
  @site.RegWorkSeries.add_prop("http://data.deichman.no/ontology#mainTitle", @context[:work_series_name])
end

When(/^jeg kan legge inn emnets navn$/) do
  @context[:subject_name] = generateRandomString
  @site.RegSubject.add_prop("http://data.deichman.no/ontology#prefLabel", @context[:subject_name])
end

When(/^jeg kan legge inn organisasjonens navn$/) do
  @context[:corporation_name] = generateRandomString
  @site.RegCorporation.add_prop("http://data.deichman.no/ontology#name", @context[:corporation_name])
end

When(/^skriver jeg inn "([^"]*)" som utgivelsens nummer i serien$/) do |issue|
  data_automation_id = "SerialIssue_http://data.deichman.no/ontology#issue_0"
  issue_field = @browser.text_field(:data_automation_id => data_automation_id)
  issue_field.focus()
  issue_field.set(issue)
  sleep 1
end

When(/^skriver jeg inn "([^"]*)" som verkets nummer i serien$/) do |issue|
  data_automation_id = "WorkSeriesPart_http://data.deichman.no/ontology#partNumber_0"
  issue_field = @browser.text_field(:data_automation_id => data_automation_id)
  issue_field.focus()
  issue_field.set(issue)
  sleep 1
end

When(/^velger jeg den første serien i listen som dukker opp$/) do
  sleep 5
  select_first_in_open_dropdown
end

When(/^sjekker jeg at utgivelsen er nummer "([^"]*)" i serien$/) do |issue|
  data_automation_id_serial = "SerialIssue_http://data.deichman.no/ontology#serial_0"
  Watir::Wait.until(timeout: BROWSER_WAIT_TIMEOUT) {
    @browser.span(:xpath => "//span[@data-automation-id='#{data_automation_id_serial}'][normalize-space()='#{@context[:serial_name]}']").present?
  }
  name = @browser.span(:xpath => "//span[@data-automation-id='#{data_automation_id_serial}'][normalize-space()='#{@context[:serial_name]}']")
  name.should exist
  data_automation_id_issue = "SerialIssue_http://data.deichman.no/ontology#issue_0"
  Watir::Wait.until(timeout: BROWSER_WAIT_TIMEOUT) {
    @browser.span(:xpath => "//span[@data-automation-id='#{data_automation_id_issue}'][normalize-space()='#{issue}']").present?
  }
end

When(/^jeg velger emnetype "([^"]*)" emne$/) do |subject_type|
  data_automation_id = "Work_http://data.deichman.no/ontology#subject_0"
  subject_type_select = @browser.select(:xpath => "//span[@data-automation-id='#{data_automation_id}']//select[not(@disabled)]")
  subject_type_select.select(subject_type)
  sleep 1
end

When(/^jeg legger inn emnet i søkefelt for emne og trykker enter$/) do
  data_automation_id = "Work_http://data.deichman.no/ontology#subject_0"
  subject_search_field = @browser.element(:xpath => "//span[@data-automation-id='#{data_automation_id}']//span[@contenteditable]")
  subject_search_field.click
  subject_search_field.send_keys "#{@context[:subject_name]}"
  subject_search_field.send_keys :enter
  sleep 1
end

When(/^velger første emne i trefflisten$/) do
  sleep 1
  @browser.inputs(:class => "select-result-item-radio").first.click
end

When(/^sjekker jeg at emnet er listet opp på verket$/) do
  data_automation_id = "Work_http://data.deichman.no/ontology#subject_0"
  subject_field = @browser.span(:xpath => "//*[@data-automation-id='#{data_automation_id}']//li/span[@class='value']")
  subject_field.text.should eq "#{@context[:subject_name]}(Generelt emne)"
end

When(/^bekrefter for å gå videre til "([^"]*)"$/) do |tab_label|
  @site.WorkFlow.next_step
  @context[:work_identifier] = @site.WorkFlow.get_work_uri || @context[:work_identifier]
  @context[:publication_identifier] = @site.WorkFlow.get_publication_uri || @context[:publication_identifier]
  @site.WorkFlow.assert_selected_tab(tab_label)
end

When(/^får jeg ingen treff$/) do
  empty_result_set_div = @browser.div(:xpath => "//div[@data-fong='sere']|//div[#{contains_class('search-result')}]")
  @browser.div(:class => 'support-panel-content').div(:class => 'search-result').span(:class => 'exact-match').should_not exist
end

When(/^jeg legger inn et nytt navn på startsida$/) do
  @site.WorkFlow.visit
  sleep 2
  step "jeg legger inn et nytt navn"
end

When(/^jeg legger inn et nytt navn$/) do
  @context[:person_name] = generateRandomString
  creator_name_field = @browser.element(:xpath => "//*[@data-automation-id='Contribution_http://data.deichman.no/ontology#agent_0' or @data-automation-id='PublicationPart_http://data.deichman.no/ontology#agent_0']//span[@contenteditable]")
  creator_name_field.click
  creator_name_field.send_keys @context[:person_name]
  creator_name_field.send_keys :enter
end


When(/^trykker jeg på knappen for å legge til ny$/) do
  @browser.a(:text => /Legg til ny/).click
end

When(/^legger jeg inn fødselsår og dødsår og velger "([^"]*)" som nasjonalitet$/) do |nationality|
  data_automation_id = "Person_http://data.deichman.no/ontology#birthYear_0"
  @context[:person_birthyear] = (1000 + rand(1015)).to_s
  @browser.text_field(:data_automation_id => data_automation_id).set(@context[:person_birthyear])

  data_automation_id = "Person_http://data.deichman.no/ontology#deathYear_0"
  @context[:person_deathyear] = (1000 + rand(1015)).to_s
  @browser.text_field(:data_automation_id => data_automation_id).set(@context[:person_deathyear])

  @browser.span(:data_automation_id => "Person_http://data.deichman.no/ontology#nationality_0").text_field().set(nationality)
  @browser.ul(:class => "select2-results__options").lis().first.click

end

When(/^jeg trykker på "([^"]*)"\-knappen$/) do |link_label|
  del_button = @browser.buttons(:text => link_label, :class => 'pure-button').select {|a| a.visible? && a.enabled?}.first
  del_button.scroll.to
  del_button.click
end

When(/^legger jeg inn et verksnavn i søkefeltet for å søke etter det$/) do
  @context[:work_maintitle] = generateRandomString
  input = @browser.span(:xpath => '//*[preceding-sibling::*/@data-uri-escaped-label = "' + URI::escape('Søk etter eksisterende verk') + '"]//span[@contenteditable]')
  input.click
  input.send_keys @context[:work_maintitle]
  input.send_keys :enter
end


When(/^trykker jeg på "([^"]*)"\-knappen$/) do |button_label|
  sleep 1
  button = @browser.elements(:text => button_label, :class => 'pure-button').find(&:visible?)
  button.scroll.to
  button.click
end

When(/^trykker jeg på "([^"]*)"\-knappen i dialogen$/) do |button_label|
  button = @browser.button(:xpath => "//button[span[@class='ui-button-text'][normalize-space()='#{button_label}']]")
#  button.wait_until_present(timeout: BROWSER_WAIT_TIMEOUT)
  button.click
end

When(/^velger jeg (.+) "([^"]*)" for "([^"]*)"$/) do |dummy, subject_type, label|
  @browser.selects(:xpath => "//span[preceding-sibling::*/@data-uri-escaped-label = '#{URI::escape(label)}']//*[#{contains_class('index-type-select')}]/select").find(&:visible?).select(subject_type)
end

When(/^at jeg vil opprette (en|et) (.*)$/) do |article, concept|
  #
end

When(/^at jeg vil slå sammen to personer$/) do
  s = TestSetup::Services.new()
  2.times do
    s.add_work_with_publications_and_contributors(0, 2)
  end
  @context[:services] = s
end

When(/^at jeg vil slå sammen to verk$/) do
  s = TestSetup::Services.new()
  2.times do
    s.add_work_with_publications_and_contributors(1, 2)
  end
  @context[:services] = s
end

When(/^at jeg vil slette et verk som er relatert til et annet$/) do
  s = TestSetup::Services.new()
  2.times do
    s.add_work_with_publications_and_contributors(1, 2)
  end
  @context[:services] = s
end

When(/^trykker jeg på knappen for å slå sammen to autoriteter$/) do
  @browser.button(:data_automation_id => 'merge_authorities').wait_until_present(timeout: BROWSER_WAIT_TIMEOUT*5)
  button = @browser.button(:data_automation_id => 'merge_authorities')
  button.scroll.to
  button.click
  sleep 1
end

When(/^åpner jeg startsiden for katalogisering med fanen for vedlikehold av autoriteter$/) do
  sleep 4
  @site.WorkFlow.visit_landing_page_auth_maintenance
  sleep 1
end


When(/^sjekker jeg at trefflistens forfatterinnslag viser nasjonalitet og levetid$/) do
  @browser.element(:text => "#{@context[:person_name]}, #{@context[:person_birthyear]}-#{@context[:person_deathyear]}").should exist
  @browser.element(:text => "#{@context[:person_nationality]}").should exist
end

When(/^at jeg legger navnet på verket inn på startsiden for arbeidsflyt og trykker enter$/) do
  @site.WorkFlow.visit
  step "at jeg legger navnet på verket og trykker enter"
end

When(/^at jeg legger navnet på verket og trykker enter$/) do
  search_work_as_main_resource = @browser.element(:xpath => "//span[@data-automation-id='searchWorkAsMainResource']//span[@contenteditable]")
  search_work_as_main_resource.scroll.to
  search_work_as_main_resource.click
  search_work_as_main_resource.send_keys @context[:work_maintitle]
  search_work_as_main_resource.send_keys :enter
end

When(/^ser jeg at det står forfatter med navn i resultatlisten$/) do
  @browser.a(:text => "#{@context[:person_name]}. #{@context[:work_maintitle]} : #{@context[:work_subtitle]}").should exist
  @browser.p(:text => "#{@context[:work_publicationyear]}").should exist
end

When(/^så trykker jeg på Legg til ny biinnførsel\-knappen$/) do
  add_button = @browser.buttons(:text, /Legg til ny biinn.*/).first
  add_button.scroll.to
  add_button.click
end

When(/^ser jeg at det er (ett|to) treff i resultatlisten$/) do |one_or_two|
  @browser.divs(:xpath => "//span[@class='support-panel']//div[@class='search-result-box']/div[@class='search-result-inner']/div[starts-with(@class, 'search-result')]").length.should eq one_or_two == 'ett' ? 1 : 2
  @browser.div(:class => 'support-panel-content').div(:class => 'search-result').div(:text => /Ingen treff/).should_not exist
end

When(/^jeg legger inn et ISBN\-nummer på startsida og trykker enter/) do
  @site.WorkFlow.visit
  sleep 2
  isbn = rand(999).to_s + rand(999).to_s + rand(999).to_s
  @context['isbn'] = isbn
  isbn_text_field = @browser.text_field(:data_automation_id => 'searchValueSuggestions')
  isbn_text_field.set isbn
  isbn_text_field.send_keys :enter
end

When(/^jeg legger inn samme ISBN\-nummer på startsida og trykker enter/) do
  @site.WorkFlow.visit
  sleep 2
  isbn = @context['isbn']
  isbn_text_field = @browser.text_field(:data_automation_id => 'searchValueSuggestions')
  isbn_text_field.set isbn
  isbn_text_field.send_keys :enter
end

When(/^Sjekker jeg at det vises treff fra preferert ekstern kilde$/) do
  Watir::Wait.until(timeout: BROWSER_WAIT_TIMEOUT) {
    @browser.li(:xpath => '//*[@class="external-source-results"]//ul/li[@class="external-hit"]').present?
  }
end

When(/^setter jeg markøren i forfatterfeltet og trykker enter$/) do
  creator_name_field = @browser.element(:xpath => "//span[@data-automation-id='Contribution_http://data.deichman.no/ontology#agent_0']//span[@contenteditable]")
  creator_name_field.click
  creator_name_field.send_keys :enter
end

When(/^setter jeg markøren i søkefelt for verk og trykker enter$/) do
  search_work_as_main_resource = @browser.span(:xpath => '//span[@data-automation-id=\'searchWorkAsMainResource\']//span[@contenteditable]')
  search_work_as_main_resource.click
  search_work_as_main_resource.send_keys :enter
end


When(/^åpner jeg listen med eksterne forslag fra andre kilder for (.*) som skal knyttes til (.*) og velger det første forslaget$/) do |predicate, domain|
  data_automation_id = "#{@site.translate(domain)}_http://data.deichman.no/ontology##{@site.translate(predicate)}_0"
  element = @browser.element(:data_automation_id => data_automation_id)
  element_type = element.tag_name
  if element_type === 'span' # this is a pre selected value
    if element.parent.class_name.include? 'sub-field'
      suggestion_list = @browser.div(:xpath => "//div[preceding-sibling::span/@data-automation-id='#{data_automation_id}'][@class='external-sources']")
    else
      suggestion_list = @browser.div(:xpath => "//div[preceding-sibling::span[descendant::span/@data-automation-id='#{data_automation_id}']][@class='external-sources']")
    end
  else
    suggestion_list = @browser.div(:xpath => "//span[descendant::span/input[@data-automation-id='#{data_automation_id}']]/span/div[@class='external-sources']")
  end

  Watir::Wait.until(timeout: BROWSER_WAIT_TIMEOUT) {
    suggestion_list.span(:class => 'unexpanded').present?
  }
  expander = suggestion_list.span(:class => 'unexpanded')
  expander.scroll.to
  expander.click

  support_panel_expander_link = suggestion_list.div(:class => "suggested-values").div(:class => "suggested-value").span(:class => 'support-panel-expander')
  use_suggestion_button = suggestion_list.div(:class => "suggested-values").div(:class => "suggested-value").button(:class => 'suggested-value')
  Watir::Wait.until(timeout: BROWSER_WAIT_TIMEOUT) {
    support_panel_expander_link.present? || use_suggestion_button.present?
  }
  if support_panel_expander_link.exists?
    support_panel_expander_link.click
  else
    if use_suggestion_button.exists?
      use_suggestion_button.scroll.to
      use_suggestion_button.click
    end
  end
end


When(/^sjekker jeg at verdien for "([^"]*)" (nå er|er) "([^"]*)"$/) do |parameter_label, nowness, expected_value|
  input = @browser.inputs(:xpath => "//*[preceding-sibling::*/@data-uri-escaped-label = '#{URI::escape(parameter_label)}']//*[self::textarea or self::input]").find(&:visible?)
  input.value.should eq expected_value
end

When(/^sjekker jeg at den siste verdien for "([^"]*)" (nå er|er) "([^"]*)"$/) do |parameter_label, nowness, expected_value|
  input = @browser.inputs(:xpath => "//*[preceding-sibling::*/@data-uri-escaped-label = '#{URI::escape(parameter_label)}']//*[self::textarea or self::input]").select(&:visible?).last
  input.value.should eq expected_value
end

When(/^trykker jeg på den (første|andre|tredje|fjerde|femte|sjette) trekanten for å søke opp personen i forslaget$/) do |ordinal|
  index = @site.translate(ordinal) - 1
  @browser.elements(:class => 'support-panel-expander').select {|a| a.visible?}[index].fire_event('click')
end

When(/^noterer jeg ned navnet på personen$/) do
  data_automation_id = "Person_http://data.deichman.no/ontology#name_0"
  name_field = @browser.text_field(:xpath => "//span[@class='support-panel']//input[@data-automation-id='#{data_automation_id}']")
  Watir::Wait.until(timeout: BROWSER_WAIT_TIMEOUT) {
    name_field.present?
  }
  @context[:person_name] = name_field.value
end

When(/^sjekker jeg at "([^"]*)" er blant verdiene som er valgt for (.*)$/) do |value, parameter_label|
  Watir::Wait.until(timeout: BROWSER_WAIT_TIMEOUT) {
    @browser.li(:xpath => "//*[preceding-sibling::*/@data-uri-escaped-label='#{URI::escape(parameter_label)}']//ul/li[@class='select2-selection__choice'][@title='#{value}']").present?
  }
end

When(/^sjekker jeg at overskriften viser informasjon om hva som blir katalogisert$/) do
  [:work_maintitle, :person_name, :corporation_name, :publication_publicationyear].each do |item|
    @browser.element(:data_automation_id => 'headline').text.include?(@context[item]).should == true
  end
end

When(/^jeg skriver verdien på (tittelnummer|verkshovedtittel) i feltet som heter "([^"]*)" og trykker enter$/) do |concept, label|
  field = @site.WorkFlow.get_text_field_from_label(label)
  field.click
  field.send_keys (@context[@site.translate(concept).to_sym])
  field.send_keys :enter
end

When(/^husker jeg tittelnummeret til senere$/) do
  @context[:publication_record_id] = /.*biblionumber=([0-9]*)/.match(@browser.a(:data_automation_id => 'biblio_record_link').attribute_value('href'))[1]
end

When(/^klikker jeg på fanen "([^"]*)"$/) do |tab_label|
  @browser.a(:xpath => "//a[@role='tab'][normalize-space()='#{tab_label}']").click
end

When(/^ombestemmer jeg meg$/) do
  #
end

When(/^fjerner jeg valgt verdi i feltet "([^"]*)"$/) do |label|
  select2_value = @site.WorkFlow.get_select2_single_value_from_label(label)
  select2_value.spans.first.click
end

When(/^skriver jeg inn "([^"]*)" og "([^"]*)" i intervallfeltene "([^"]*)"$/) do |lower, upper, label|
  @site.WorkFlow.get_low_range_text_field_from_label(label).set(lower)
  @site.WorkFlow.get_high_range_text_field_from_label(label).set(upper)
end

When(/^krysser jeg av i avkrysningboksen for "([^"]*)"$/) do |label|
  checkbox = @site.WorkFlow.get_checkbox_from_label(label)
  checkbox.click
  save_value_for_later(checkbox, label, 'on')
end

When(/^klikker jeg utenfor sprettopp\-skjemaet$/) do
  @browser.h2s().first.click
end

When(/^husker (.*)et på (.*)(en|et) jeg nettopp opprettet$/) do |field, domain, article|
  data_automation_id = "#{@site.translate(domain)}_http://data.deichman.no/ontology##{@site.translate(field)}_0"
  @context["#{@site.translate(domain).downcase}_#{@site.translate(field).downcase}".to_sym] = @browser.input(:data_automation_id => data_automation_id).value
end

When(/^at jeg er i arbeidsflyten$/) do
  @site.WorkFlow.visit
end


When(/^sjekker jeg at den tilfeldige verdien jeg la inn for feltet "([^"]*)" stemmer med (.*) pluss "([^"]*)"/) do |parameter_label, concept, additionalText|
  value_span = @browser.spans(:xpath => "//*[preceding-sibling::*/@data-uri-escaped-label = '#{URI::escape(parameter_label)}']//span[#{contains_class 'value'}]/span").find(&:visible?)
  value_span.text.should eq @context["random_#{@site.translate(concept)}".to_sym] + additionalText
end

When(/^sjekker jeg at den verdien jeg la inn for "([^"]*)" inneholder (.*)/) do |parameter_label, concept|
  value_span = @browser.spans(:xpath => "//*[preceding-sibling::*/@data-uri-escaped-label = '#{URI::escape(parameter_label)}'][#{contains_class 'value'}]/span|//*[preceding-sibling::*/@data-uri-escaped-label = '#{URI::escape(parameter_label)}'][#{contains_class 'value'}]//li/span[@class='value']").find(&:visible?)
  value_span.text.should include @context["#{@site.translate(concept)}".to_sym]
end

When(/^frisker jeg opp nettleseren$/) do
  @browser.refresh
  sleep 5
end

When(/^vises en dialog med tittelen "([^"]*)"$/) do |dialog_title|
  @browser.span(:class => 'ui-dialog-title', :text => dialog_title).visible?.should eq true
end

When(/^jeg legger inn samme ISBN\-nummer i ISBN\-feltet til utgivelsen$/) do
  isbn_text_field = @browser.text_field(:data_automation_id => 'Publication_http://data.deichman.no/ontology#isbn_0')
  isbn_text_field.set @context['isbn']
  isbn_text_field.send_keys :tab
end

When(/^velger jeg "([^"]*)" som nasjonalitet på verket$/) do |nationality|
  @browser.span(:data_automation_id => "Work_http://data.deichman.no/ontology#nationality_0").text_field().set(nationality)
  @browser.ul(:class => "select2-results__options").lis().first.click
end

When(/^jeg fjerner valgt verdi for "([^"]*)"$/) do |label|
  deletable = @site.WorkFlow.get_deletable_from_label(label)
  deletable.click
end

When(/^lukker jeg dialogen$/) do
  @browser.element(:class => 'ui-dialog-titlebar-close').wait_until_present(timeout: BROWSER_WAIT_TIMEOUT*5)
  @browser.element(:class => 'ui-dialog-titlebar-close').click
end

When(/^legger inn siste del av verkts uri i feltet "([^"]*)"$/) do |label|
  field = @site.WorkFlow.get_text_field_from_label(label)
  field.click
  field.send_keys @context[:work_identifier].split('/').last
end

When(/^klikker jeg på linken for utvidet redigering$/) do
  @browser.a(:text => 'Utvidet redigering').click
end

When(/^klikker jeg på linken for masseregistrering$/) do
  @browser.a(:text => 'Masseregistrering').click
end

When(/^sjekker jeg at antall relasjoner er ([0-9]*)$/) do |number_of_relations|
  @browser.a(:class => 'toggle-show-sub-items') do |a|
    a.scroll.to
    a.click
  end
  @browser.lis(:class => 'rel-entry').length.should equal? (number_of_relations.to_i)
end

When(/^klikker jeg på linken med blyantikon$/) do
  @browser.as(:class => 'edit').find(&:visible?).click
end


When(/^at jeg vil splitte et verk med flere utgivelser$/) do
  #
end

When(/^sjekker jeg at teksten "([^"]*)" finnes på siden$/) do |text|
  @browser.element(:text => text).should exist
end

When(/^skal det vises (\d+) deler i utgivelsen$/) do |arg|
  @browser.h3s(:class => "accordionHeader").length.should eq arg.to_i
end

When(/^drar jeg et element fra "([^"]*)" på høyre side til venstre side$/) do |label|
  draggable = @site.WorkFlow.get_draggable_from_label(label)
  draggable.scroll.to
  drop_zone = @site.WorkFlow.get_dropzone_from_label(label)
  draggable.fire_event("onmousedown")
  driver=@browser.driver
  driver.action.click_and_hold(draggable.wd).perform
  sleep 2
  driver.action.move_to(drop_zone.wd).perform
  sleep 2
  drop_zone.fire_event("onmouseup")
end

When(/^dialogen viser at verket ikke kan slettes$/) do
  @browser.span(:data_automation_id => 'undeleteable-work').should exist
end

When(/^klikker jeg på lenkene for å vise mindre brukte felter$/) do
  @browser.as(:class => 'toggle-esoteric').each do |a|
    if a.visible?
      a.scroll.to
      a.click
    end
  end
  sleep 1
end

When(/^viser brukergrensenittet at jeg har åpnet en kopi$/) do
  @browser.body(:class => 'copy').should exist
end