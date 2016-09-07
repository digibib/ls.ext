When(/^debugger jeg$/) do
  sleep(1)
end

When(/^at jeg har en bok$/) do
  #
end

When(/^at det finnes et verk med forfatter$/) do
  step "at jeg er i personregistergrensesnittet"
  step "leverer systemet en ny ID for den nye personen"
  step "jeg kan legge inn navn fødselsår og dødsår for personen"
  step "jeg kan legge inn tittel og nasjonalitet for personen"
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

When(/^jeg legger inn forfatternavnet på startsida$/) do
  @site.WorkFlow.visit
  creator_name_field = @browser.text_field(:xpath => "//span[@data-automation-id='Contribution_http://#{ENV['HOST']}:8005/ontology#agent_0']/input")
  creator_name_field.set(@context[:person_name])
  creator_name_field.send_keys :enter
end


def contains_class(class_name)
  "contains(concat(' ',normalize-space(@class),' '),' #{class_name} ')"
end

When(/^velger jeg (en|et) (person|organisasjon|utgivelse|utgiver|sted|serie|emne|sjanger|hendelse|sted) fra treffliste fra (person|organisasjons|utgivelses|utgiver|sted|serie|emne|sjanger|hendelses|steds)registeret$/) do |art, type_1, type_2|
  Watir::Wait.until(BROWSER_WAIT_TIMEOUT*5) {
    @browser.element(:xpath => "//a[#{contains_class('edit-resource')}]|//input[contains(concat(' ',normalize-space(@class),' '),' select-result-item-radio ')]").present?
#    @browser.a(:class => 'edit-resource').present? || @browser.input(:class => "select-result-item-radio").present?
  }
  if @browser.a(:class => 'edit-resource').present?
    @browser.as(:class => 'edit-resource').first.click
  end
  if @browser.input(:class => "select-result-item-radio").present?
    @browser.inputs(:class => "select-result-item-radio").first.click
  end
end

When(/^velger verket fra lista tilkoplet forfatteren$/) do
  wait_for{
    @browser.span(:class => "toggle-show-sub-items").present?
  }
  @browser.spans(:class => "toggle-show-sub-items").first.click
  @browser.inputs(:class => "select-work-radio").first.click
end

When(/^verifiserer at verkets basisopplysninger uten endringer er korrekte$/) do
  @browser.text_field(:data_automation_id => "Work_http://#{ENV['HOST']}:8005/ontology#mainTitle_0").value.should eq @context[:work_maintitle]
end

When(/^verifiserer verkets tilleggsopplysninger uten endringer er korrekte$/) do
  @browser.select(:data_automation_id => "Work_http://#{ENV['HOST']}:8005/ontology#language_0").selected_options.include? @context[:work_language]
end

When(/^legger inn opplysningene om utgivelsen$/) do
  # TODO: Unify add_prop and select_prop in the page objects to avoid having to specify it.
  data = Hash.new
  data['publicationYear'] = [(1000 + rand(1015)).to_s, :add_prop]
  data['format'] = [:random, :select_prop]
  data['partTitle'] = [generateRandomString, :add_prop]
  data['partNumber'] = [generateRandomString, :add_prop]
  data['edition'] = [generateRandomString, :add_prop]
  data['numberOfPages'] = [rand(999).to_s, :add_prop]
  data['isbn'] = [generateRandomString, :add_prop]
  data['illustrativeMatter'] = [:random, :select_prop]
  data['hasFormatAdaptation'] = [:random, :select_prop]
  data['binding'] = [:random, :select_prop]
  data['writingSystem'] = [:first, :select_prop]

  workflow_batch_add_props 'Publication', data
end

def workflow_batch_add_props(domain, data)
  data.each do |fragment, (value, method)|
    begin
      predicate = "http://#{ENV['HOST']}:8005/ontology##{fragment}"
      textualValue = value;
      if value.eql?(:random) && method.eql?(:select_prop)
        choices = @site.WorkFlow.get_available_select_choices(domain, predicate)
        sampleNr = rand(choices.length)
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
  predicate = input_id.sub(/^([a-zA-Z]*)_/, '').sub(/_[0-9]+$/, '')
  domain = input_id.match(/^([a-zA-Z]*)_.*/).captures[0]
  @context[parameter_label] = value
  return domain, predicate
end

When(/^jeg skriver verdien "([^"]*)" for "([^"]*)"$/) do |value, parameter_label|
  input = @browser.inputs(:xpath => "//*[preceding-sibling::*/@data-uri-escaped-label = '#{URI::escape(parameter_label)}']//*[self::textarea or self::input]").find(&:visible?)
  domain, predicate = save_value_for_later(input, parameter_label, value)
  @site.WorkFlow.add_prop(domain, predicate, value)
end

def predicate_from_automation_id(select_id)
  select_id.sub(/^(Work|Publication|Person|WorkRelation)_/, '').sub(/_[0-9]+$/, '')
end

def domain_of_automation_id(select_id)
  select_id.match(/^(Work|Publication|Person|WorkRelation)_.*/).captures[0]
end

def do_select_value(selectable_parameter_label, value)
  select = @browser.selects(:xpath => "//*[preceding-sibling::*/@data-uri-escaped-label='#{URI::escape(selectable_parameter_label)}']//select")[0]
  wait_for{select.present?}
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

When(/^jeg velger verdiene "([^"]*)" og "([^"]*)" for "([^"]*)"$/) do |value_1, value_2, selectable_parameter_label|
  do_select_value(selectable_parameter_label, value_1)
  do_select_value(selectable_parameter_label, value_2)
  @context[selectable_parameter_label] = [value_1, value_2]
end

When(/^jeg følger lenken til posten i Koha i arbeidsflyten$/) do
  link = @browser.a(:data_automation_id => 'biblio_record_link').href
  steps 'at jeg er logget inn som adminbruker'
  @browser.goto(link)
end

When(/^tar jeg en liten pause$/) do
  sleep(1)
end


When(/^at jeg skriver inn sted i feltet for utgivelsessted og trykker enter$/) do
  data_automation_id = "Publication_http://#{ENV['HOST']}:8005/ontology#hasPlaceOfPublication_0"
  publication_place_field = @browser.text_field(:xpath => "//span[@data-automation-id='#{data_automation_id}']//input[@type='search']")
  publication_place_field.click
  publication_place_field.set(@context[:placeofpublication_place])
#  publication_place_field.send_keys :enter
end

When(/^at jeg skriver inn (tilfeldig |)(.*) i feltet "([^"]*)" og trykker enter$/) do |is_random, concept, label|
  field = @site.WorkFlow.get_text_field_from_label(label)
  field.click
  if (is_random == 'tilfeldig ')
    @context[("random_#{@site.translate(concept)}_name").to_sym] = generateRandomString
    field.set(@context[("random_#{@site.translate(concept)}_name").to_sym])
  else
    field.set(@context[("#{@site.translate(concept)}_name").to_sym])
  end
  field.send_keys :enter
end

When(/^skriver jeg inn samme (tilfeldige |)(.*) i feltet "([^"]*)" og trykker enter$/) do |is_random, concept, label|
  field = @site.WorkFlow.get_text_field_from_label(label)
  field.click
  if (is_random == 'tilfeldige ')
    field.set(@context[("random_#{@site.translate(concept)}_name").to_sym])
  else
    field.set(@context[("#{@site.translate(concept)}_name").to_sym])
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
  data_automation_id = "Contribution_http://#{ENV['HOST']}:8005/ontology#agent_0"
  person_name_field = @browser.text_field(:xpath => "//span[@data-automation-id='#{data_automation_id}']//input[@type='search']")
  person_name_field.set(@context[:person_name])
  person_name_field.send_keys :enter
end

When(/^trykker jeg på knappen for å avslutte$/) do
  @site.WorkFlow.finish
end

When(/^velger radioknappen for "([^"]*)" for å velge "([^"]*)"$/) do |value, label|
  input = @browser.inputs(:xpath => "//input[@type='radio'][following-sibling::label='#{value}']")[0]
  input.click
end

When(/^jeg velger rollen "([^"]*)"$/) do |role_name|
  data_automation_id_1 = "Contribution_http://#{ENV['HOST']}:8005/ontology#role_0"
  data_automation_id_2 = "PublicationPart_http://#{ENV['HOST']}:8005/ontology#role_0"
  role_select_field = @browser.text_fields(:xpath => "//span[@data-automation-id='#{data_automation_id_1}' or @data-automation-id='#{data_automation_id_2}']//input[@type='search'][not(@disabled)]").find(&:visible?)
  role_select_field.click
  role_select_field.set(role_name)
  select_first_in_open_dropdown
  @context[:person_role] = role_name
end

When(/^trykker jeg på knappen for legge til biinnførselen$/) do
  @browser.elements(:xpath => "//*[@id='confirm-addedentry']//span[@class='subject-type-association']//*[text()='Legg til']").first.click
end

When(/^trykker jeg på knappen for legge til serieinformasjon$/) do
  @browser.elements(:xpath => "//*[@id='describe-publication']//*[text()='Legg til']").first.click
end

When(/^trykker jeg på knappen for legge til mer$/) do
  @browser.elements(:xpath => "//div[./div[@data-uri-escaped-label='Biinnf%C3%B8rsel']]//*[text()='Legg til ny']").first.click
end

When(/^sjekker jeg at det finnes en (bi|hoved)innførsel hvor personen jeg valgte har rollen "([^"]*)" knyttet til "([^"]*)"$/) do |type, role_name, association|
  data_automation_id_agent = "Contribution_http://#{ENV['HOST']}:8005/ontology#agent_0"
  name = @browser.span(:xpath => "//span[@data-automation-id='#{data_automation_id_agent}'][normalize-space()='#{@context[:person_name]}']")
  Watir::Wait.until(BROWSER_WAIT_TIMEOUT) {
    name.exists?
  }
  name.should exist
  data_automation_id_role = "Contribution_http://#{ENV['HOST']}:8005/ontology#role_0"
  role_span = @browser.span(:xpath => "//span[@data-automation-id='#{data_automation_id_role}']//span[normalize-space()='#{@site.translate(role_name)}']")
  role_span.should exist

  @browser.span(:xpath => "//span[@class='subject-type-association'][./span[text()='#{association}']]").should exist
end

When(/^sjekker jeg at det er "([^"]*)" biinnførsler totalt$/) do |number_of_additional_entries|
  @browser.divs(:xpath => "//div[@data-issue-association]").length.should equal?(number_of_additional_entries.to_i)
end

When(/^fjerner jeg den første biinførselen$/) do
  @browser.as(:xpath => "//*[@id='confirm-addedentry']//a[@class='delete']").first.click
end

When(/^fjerner jeg hovedinnførselen$/) do
  @browser.as(:xpath => "//*[@id='confirm-person']//a[@class='delete']").first.click
end

When(/^at jeg skriver inn serie i feltet for serie og trykker enter$/) do
  data_automation_id = "SerialIssue_http://#{ENV['HOST']}:8005/ontology#serial_0"
  serial_field = @browser.text_field(:xpath => "//span[@data-automation-id='#{data_automation_id}']//input[@type='search']")
  serial_field.click
  serial_field.set(@context[:serial_name])
  serial_field.send_keys :enter

end

When(/^jeg kan legge inn seriens navn$/) do
  @context[:serial_name] = generateRandomString
  @site.RegSerial.add_prop("http://#{ENV['HOST']}:8005/ontology#name", @context[:serial_name])
end

When(/^jeg kan legge inn emnets navn$/) do
  @context[:subject_name] = generateRandomString
  @site.RegSubject.add_prop("http://#{ENV['HOST']}:8005/ontology#prefLabel", @context[:subject_name])
end

When(/^jeg kan legge inn organisasjonens navn$/) do
  @context[:corporation_name] = generateRandomString
  @site.RegCorporation.add_prop("http://#{ENV['HOST']}:8005/ontology#name", @context[:corporation_name])
end

When(/^skriver jeg inn "([^"]*)" som utgivelsens nummer i serien$/) do |issue|
  data_automation_id = "SerialIssue_http://#{ENV['HOST']}:8005/ontology#issue_0"
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
  data_automation_id_serial = "SerialIssue_http://#{ENV['HOST']}:8005/ontology#serial_0"
  wait_for {
    @browser.span(:xpath => "//span[@data-automation-id='#{data_automation_id_serial}'][normalize-space()='#{@context[:serial_name]}']").present?
  }
  name = @browser.span(:xpath => "//span[@data-automation-id='#{data_automation_id_serial}'][normalize-space()='#{@context[:serial_name]}']")
  name.should exist
  data_automation_id_issue = "SerialIssue_http://#{ENV['HOST']}:8005/ontology#issue_0"
  Watir::Wait.until(BROWSER_WAIT_TIMEOUT) {
    @browser.span(:xpath => "//span[@data-automation-id='#{data_automation_id_issue}'][normalize-space()='#{issue}']").present?
  }
end

When(/^jeg velger emnetype "([^"]*)" emne$/) do |subject_type|
  data_automation_id = "Work_http://#{ENV['HOST']}:8005/ontology#subject_0"
  subject_type_select = @browser.select(:xpath => "//span[@data-automation-id='#{data_automation_id}']//select[not(@disabled)]")
  subject_type_select.select(subject_type)
  sleep 1
end

When(/^jeg legger inn emnet i søkefelt for emne og trykker enter$/) do
  data_automation_id = "Work_http://#{ENV['HOST']}:8005/ontology#subject_0"
  subject_search_field = @browser.text_field(:xpath => "//span[@data-automation-id='#{data_automation_id}']//input[@type='search'][not(@disabled)]")
  subject_search_field.set(@context[:subject_name])
  subject_search_field.send_keys :enter
  sleep 1
end

When(/^velger første emne i trefflisten$/) do
  sleep 1
  @browser.inputs(:class => "select-result-item-radio").first.click
end

When(/^sjekker jeg at emnet er listet opp på verket$/) do
  data_automation_id = "Work_http://#{ENV['HOST']}:8005/ontology#subject_0"
  subject_field = @browser.span(:xpath => "//*[@data-automation-id='#{data_automation_id}']//li/span[@class='value']")
  subject_field.text.should eq @context[:subject_name]
end

When(/^bekrefter for å gå videre til "([^"]*)"$/) do |tab_label|
  @site.WorkFlow.next_step
  @context[:work_identifier] = @site.WorkFlow.get_work_uri || @context[:work_identifier]
  @context[:publication_identifier] = @site.WorkFlow.get_publication_uri || @context[:publication_identifier]
  @site.WorkFlow.assert_selected_tab(tab_label)
end

When(/^får jeg ingen treff$/) do
  empty_result_set_div = @browser.div(:class => 'support-panel-content').div(:class => 'search-result').div(:text => /Ingen treff/)
  Watir::Wait.until(BROWSER_WAIT_TIMEOUT) {
    empty_result_set_div.present?
  }
  empty_result_set_div.should exist
end

When(/^jeg legger inn et nytt navn på startsida$/) do
  @site.WorkFlow.visit
  step "jeg legger inn et nytt navn"
end

When(/^jeg legger inn et nytt navn$/) do
  @context[:person_name] = generateRandomString
  creator_name_field = @browser.text_field(:xpath => "//*[@data-automation-id='Contribution_http://#{ENV['HOST']}:8005/ontology#agent_0' or @data-automation-id='PublicationPart_http://#{ENV['HOST']}:8005/ontology#agent_0']/input")
  creator_name_field.set(@context[:person_name])
  creator_name_field.send_keys :enter
end



When(/^trykker jeg på knappen for å legge til ny$/) do
  @browser.a(:text => /Legg til ny/).click
end

When(/^legger jeg inn fødselsår og dødsår og velger "([^"]*)" som nasjonalitet$/) do |nationality|
  data_automation_id = "Person_http://#{ENV['HOST']}:8005/ontology#birthYear_0"
  @context[:person_birthyear] = (1000 + rand(1015)).to_s
  @browser.text_field(:data_automation_id => data_automation_id).set(@context[:person_birthyear])

  data_automation_id = "Person_http://#{ENV['HOST']}:8005/ontology#deathYear_0"
  @context[:person_deathyear] = (1000 + rand(1015)).to_s
  @browser.text_field(:data_automation_id => data_automation_id).set(@context[:person_deathyear])

  @browser.span(:data_automation_id => "Person_http://#{ENV['HOST']}:8005/ontology#nationality_0").text_field().set(nationality)
  @browser.ul(:class => "select2-results__options").lis().first.click

end

When(/^jeg trykker på "([^"]*)"\-knappen$/) do |link_label|
  @browser.buttons(:text => link_label, :class => 'pure-button').select { |a| a.visible? && a.enabled?}.first.click
end

When(/^legger jeg inn et verksnavn i søkefeltet for å søke etter det$/) do
  @context[:work_maintitle] = generateRandomString
  input = @browser.text_field(:xpath => '//*[preceding-sibling::*/@data-uri-escaped-label = "' + URI::escape('Søk etter eksisterende verk') + '"]//input')
  input.set(@context[:work_maintitle])
  input.send_keys :enter
end


When(/^trykker jeg på "([^"]*)"\-knappen$/) do |button_label|
  @browser.element(:text => button_label, :class => 'pure-button').wait_until_present(BROWSER_WAIT_TIMEOUT*5)
  @browser.element(:text => button_label, :class => 'pure-button').click
end

When(/^trykker jeg på "([^"]*)"\-knappen i dialogen$/) do |button_label|
  button = @browser.button(:xpath => "//button[span[@class='ui-button-text'][normalize-space()='#{button_label}']]")
  button.wait_until_present(BROWSER_WAIT_TIMEOUT)
  button.click
end

When(/^velger jeg (emnetype|aktørtype) "([^"]*)"$/) do |dummy, subject_type|
  @browser.span(:class => 'index-type-select').select().select(subject_type)
end

When(/^at jeg vil opprette (en|et) (.*)$/) do |article, concept|
  #
end

When(/^åpner jeg startsiden for katalogisering med fanen for vedlikehold av autoriteter$/) do
  @site.WorkFlow.visit_landing_page_auth_maintenance
end


When(/^sjekker jeg at trefflistens forfatterinnslag viser nasjonalitet og levetid$/) do
  @browser.element(:text => "(#{@context[:person_birthyear]}–#{@context[:person_deathyear]}) - #{@context[:person_nationality]}").should exist
end

When(/^at jeg legger navnet på verket inn på startsiden for arbeidsflyt og trykker enter$/) do
  @site.WorkFlow.visit
  step "at jeg legger navnet på verket og trykker enter"
end

When(/^at jeg legger navnet på verket og trykker enter$/) do
  search_work_as_main_resource = @browser.text_field(:data_automation_id => 'searchWorkAsMainResource')
  search_work_as_main_resource.set(@context[:work_maintitle])
  search_work_as_main_resource.send_keys :enter
end

When(/^ser jeg at det står forfatter med navn og levetid i resultatlisten$/) do
  @browser.element(:text => "#{@context[:person_name]} (#{@context[:person_birthyear]}–#{@context[:person_deathyear]})").should exist
end

When(/^så trykker jeg på Legg til ny biinnførsel\-knappen$/) do
  @browser.buttons(:text, /Legg til ny biinn.*/).first.click
end

When(/^ser jeg at det er (ett|to) treff i resultatlisten$/) do |one_or_two|
  @browser.divs(:xpath => "//span[@class='support-panel']//div[@class='search-result-box']/div[@class='search-result-inner']/div[starts-with(@class, 'search-result')]").length.should eq one_or_two == 'ett' ? 1 : 2
  @browser.div(:class => 'support-panel-content').div(:class => 'search-result').div(:text => /Ingen treff/).should_not exist
end

When(/^jeg legger inn et ISBN\-nummer på startsida og trykker enter/) do
  @site.WorkFlow.visit
  isbn = rand(999).to_s + rand(999).to_s + rand(999).to_s
  @context['isbn'] = isbn
  isbn_text_field = @browser.text_field(:data_automation_id => 'searchValueSuggestions')
  isbn_text_field.set isbn
  isbn_text_field.send_keys :enter
end

When(/^Sjekker jeg at det vises treff fra preferert ekstern kilde$/) do
  Watir::Wait.until(BROWSER_WAIT_TIMEOUT) {
    @browser.li(:xpath => '//*[@class="external-source-results"]//ul/li[@class="external-hit"]').present?
  }
end

When(/^setter jeg markøren i forfatterfeltet og trykker enter$/) do
  creator_name_field = @browser.text_field(:xpath => "//span[@data-automation-id='Contribution_http://#{ENV['HOST']}:8005/ontology#agent_0']/input")
  creator_name_field.send_keys :enter
end

When(/^setter jeg markøren i søkefelt for verk og trykker enter$/) do
  search_work_as_main_resource = @browser.text_field(:data_automation_id => 'searchWorkAsMainResource')
  search_work_as_main_resource.send_keys :enter
end


When(/^åpner jeg listen med eksterne forslag fra andre kilder for (.*) som skal knyttes til (.*) og velger det første forslaget$/) do |predicate, domain|
  data_automation_id = "#{@site.translate(domain)}_http://#{ENV['HOST']}:8005/ontology##{@site.translate(predicate)}_0"
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

  Watir::Wait.until(BROWSER_WAIT_TIMEOUT) {
    suggestion_list.span(:class => 'unexpanded').present?
  }
  suggestion_list.span(:class => 'unexpanded').click
  support_panel_expander_link = suggestion_list.div(:class => "suggested-values").div(:class => "suggested-value").span(:class => 'support-panel-expander')
  use_suggestion_button = suggestion_list.div(:class => "suggested-values").div(:class => "suggested-value").button(:class => 'suggested-value')
  Watir::Wait.until(BROWSER_WAIT_TIMEOUT) {
    support_panel_expander_link.present? || use_suggestion_button.present?
  }
  if support_panel_expander_link.exists?
    support_panel_expander_link.click
  else
    use_suggestion_button.click if use_suggestion_button.exists?
  end
end


When(/^sjekker jeg at verdien for "([^"]*)" (nå er|er) "([^"]*)"$/) do |parameter_label, nowness, expected_value|
  input = @browser.inputs(:xpath => "//*[preceding-sibling::*/@data-uri-escaped-label = '#{URI::escape(parameter_label)}']//*[self::textarea or self::input]").find(&:visible?)
  input.value.should eq expected_value
end

When(/^trykker jeg på den (første|andre|tredje|fjerde|femte|sjette) trekanten for å søke opp personen i forslaget$/) do |ordinal|
  index = @site.translate(ordinal) - 1
  @browser.elements(:class => 'support-panel-expander').select { |a| a.visible? }[index].click
end

When(/^noterer jeg ned navnet på personen$/) do
  data_automation_id = "Person_http://#{ENV['HOST']}:8005/ontology#name_0"
  name_field = @browser.text_field(:xpath => "//span[@class='support-panel']//input[@data-automation-id='#{data_automation_id}']")
  Watir::Wait.until(BROWSER_WAIT_TIMEOUT) {
    name_field.present?
  }
  @context[:person_name] = name_field.value
end

When(/^sjekker jeg at "([^"]*)" er blant verdiene som er valgt for (.*)$/) do |value, parameter_label|
  Watir::Wait.until(BROWSER_WAIT_TIMEOUT) {
    @browser.span(:xpath => "//*[preceding-sibling::*/@data-uri-escaped-label='#{URI::escape(parameter_label)}']//ul/li[@class='select2-selection__choice']/span[normalize-space()='#{value}']").present?
  }
end

When(/^sjekker jeg at overskriften viser informasjon om hva som blir katalogisert$/) do
  [:work_maintitle, :person_name, :corporation_name, :publication_publicationyear].each do |item|
    @browser.element(:data_automation_id => 'headline').text.include?(@context[item]).should == true
  end
end

When(/^jeg skriver verdien på (tittelnummer|verkshovedtittel) i feltet som heter "([^"]*)" og trykker enter$/) do |concept, label|
  field = @site.WorkFlow.get_text_field_from_label(label)
  field.set(@context[@site.translate(concept).to_sym])
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
  data_automation_id = "#{@site.translate(domain)}_http://#{ENV['HOST']}:8005/ontology##{@site.translate(field)}_0"
  @context["#{@site.translate(domain).downcase}_#{@site.translate(field).downcase}".to_sym] = @browser.input(:data_automation_id => data_automation_id).value
end

When(/^at jeg er i arbeidsflyten$/) do
  @site.WorkFlow.visit
end


When(/^sjekker jeg at den tilfeldige verdien jeg la inn for feltet "([^"]*)" stemmer med (.*)/) do |parameter_label, concept|
  value_span = @browser.spans(:xpath => "//*[preceding-sibling::*/@data-uri-escaped-label = '#{URI::escape(parameter_label)}'][#{contains_class 'value'}]/span").find(&:visible?)
  value_span.text.should eq @context["random_#{@site.translate(concept)}".to_sym]
end

When(/^frisker jeg opp nettleseren$/) do
  @browser.refresh
  sleep 5
end