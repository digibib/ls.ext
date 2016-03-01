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
  step "jeg legger til et årstall for førsteutgave av nye verket"
  step "jeg kan legge til språk for det nye verket"
  step "grensesnittet viser at endringene er lagret"
end

When(/^jeg legger inn forfatternavnet på startsida$/) do
  @site.WorkFlow.visit
  creator_name_field = @browser.text_field(:data_automation_id => "Work_http://#{ENV['HOST']}:8005/ontology#creator_0")
  creator_name_field.set(@context[:person_name])
  creator_name_field.send_keys :enter
end

When(/^velger jeg forfatter fra treffliste fra personregisteret$/) do
  @browser.inputs(:class => "select-creator-radio")[0].click
end

When(/^velger verket fra lista tilkoplet forfatteren$/) do
  @browser.spans(:class => "toggle-show-works")[0].click
  @browser.inputs(:class => "select-work-radio")[0].click
end

When(/^bekrefter for å gå videre til bekreft verk$/) do
  @site.WorkFlow.next_step
  @context[:work_identifier] = @site.WorkFlow.get_work_uri
  @site.WorkFlow.assert_selected_tab("Bekreft verk")
end

When(/^bekrefter for å gå videre til beskriv verket$/) do
  @site.WorkFlow.next_step
  @site.WorkFlow.assert_selected_tab("Beskriv verket")
end

When(/^bekrefter for å gå videre til beskriv utgivelsen$/) do
  @site.WorkFlow.next_step
  @context[:publication_identifier] = @site.WorkFlow.get_publication_uri
  @site.WorkFlow.assert_selected_tab("Beskriv utgivelsen")
end

When(/^bekrefter for å gå videre til biinførsler/) do
  @site.WorkFlow.next_step
  @site.WorkFlow.assert_selected_tab("Bekreft biinførsler")
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
  data['mainTitle'] = [generateRandomString, :add_prop]
  data['subtitle'] = [generateRandomString, :add_prop]
  data['publicationYear'] = [rand(2015).to_s, :add_prop]
  data['format'] = [:random, :select_prop]
  data['language'] = [:random, :select_prop]
  data['partTitle'] = [generateRandomString, :add_prop]
  data['partNumber'] = [generateRandomString, :add_prop]
  data['edition'] = [generateRandomString, :add_prop]
  data['numberOfPages'] = [rand(999).to_s, :add_prop]
  data['isbn'] = [generateRandomString, :add_prop]
  data['illustrativeMatter'] = [:random, :select_prop]
  data['adaptationOfPublicationForParticularUserGroups'] = [:random, :select_prop]
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
    rescue
      fail "Error adding #{fragment} for #{domain}"
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

When(/^jeg skriver verdien "([^"]*)" for "([^"]*)"$/) do |value, parameter_label|
  input = @browser.inputs(:xpath => '//input[preceding-sibling::label/@data-uri-escaped-label = "' + URI::escape(parameter_label) + '"]')[0]
  input_id = input.attribute_value('data-automation-id')
  predicate = input_id.sub(/^(Work|Publication|Person)_/, '').sub(/_[0-9]+$/, '')
  domain = input_id.match(/^(Work|Publication|Person)_.*/).captures[0]
  @site.WorkFlow.add_prop(domain, predicate, value)
  fragment = predicate.partition('#').last()
  symbol = "#{domain.downcase}_#{fragment.downcase}".to_sym
  @context[parameter_label] = value
end

def do_select_value(selectable_parameter_label, value)
  select = @browser.selects(:xpath => '//span[preceding-sibling::label/@data-uri-escaped-label = "' + URI::escape(selectable_parameter_label) + '"]/select')[0]
  select_id = select.attribute_value('data-automation-id')
  predicate = select_id.sub(/^(Work|Publication|Person)_/, '').sub(/_[0-9]+$/, '')
  domain = select_id.match(/^(Work|Publication|Person)_.*/).captures[0]
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


When(/^at jeg skriver inn utgivelsessted i feltet for utgivelsessted og trykker enter$/) do
  data_automation_id = "Publication_http://#{ENV['HOST']}:8005/ontology#placeOfPublication_0"
  publication_place_field = @browser.text_field(:xpath => "//span[@data-automation-id='#{data_automation_id}']//input[@type='search']")
  publication_place_field.click
  publication_place_field.set(@context[:placeofpublication_place])
  publication_place_field.send_keys :enter
end

When(/^velger jeg første utgivelsessted i listen som dukker opp$/) do
  sleep 5
  @browser.elements(:xpath => "//span[@class='select2-results']/ul/li")[0].click
end

When(/^jeg legger inn navn på en person som skal knyttes til biinnførsel$/) do
  # person_name_field = @browser.text_field(:data_automation_id => "Work_http://#{ENV['HOST']}:8005/ontology#creator_0")
  # person_name_field.set(@context[:person_name])
  # person_name_field.send_keys :enter
end

When(/^trykker jeg på knappen for å avslutte$/) do
  @site.WorkFlow.finish
end