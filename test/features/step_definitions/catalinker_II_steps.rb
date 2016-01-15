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

When(/^verifiserer at verkets basisopplysninger uten endringer er korrekte$/) do
  @browser.text_field(:data_automation_id => "Work_http://#{ENV['HOST']}:8005/ontology#mainTitle_0").value.should eq @context[:work_title]
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
  data['format'] = [%w(Bok Lydbok Mikrofilm).sample, :select_prop]
  data['language'] = [%w(Norsk Svensk Dansk).sample, :select_prop]
  data['partTitle'] = [generateRandomString, :add_prop]
  data['partNumber'] = [generateRandomString, :add_prop]
  data['edition'] = [generateRandomString, :add_prop]
  data['numberOfPages'] = [rand(999).to_s, :add_prop]
  data['isbn'] = [generateRandomString, :add_prop]
  data['illustrativeMatter'] = [%w(Illustrert Kart Figur).sample, :select_prop]
  data['adaptionForParticularUserGroups'] = [%w(Blindeskrift Tegnspråk).sample, :select_prop]
  data['binding'] = [%w(Innbundet Heftet).sample, :select_prop]
  data['writingSystem'] = [%w(Kyrillisk Kinesisk Arabisk).sample, :select_prop]

  workflow_batch_add_props 'Publication', data
end

def workflow_batch_add_props(domain, data)
  data.each do |fragment, (value, method)|
    symbol = "#{domain.downcase}_#{fragment.downcase}".to_sym # e.g. :publication_format
    @context[symbol] = value
    begin
      @site.WorkFlow.method(method).call(domain, "http://#{ENV['HOST']}:8005/ontology##{fragment}", @context[symbol], 0, true)
    rescue
      fail "Error adding #{fragment} for #{domain}"
    end
  end
  sleep 2
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