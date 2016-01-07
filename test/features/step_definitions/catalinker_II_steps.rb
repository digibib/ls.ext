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
  @site.WorkFlow.nextStep
  @site.WorkFlow.assertSelectedTab("Bekreft verk")
end

When(/^bekrefter at verkets basisopplysninger uten endringer er korrekte$/) do
  @browser.text_field(:data_automation_id => "Work_http://#{ENV['HOST']}:8005/ontology#mainTitle_0").value.should eq @context[:work_title]
end

When(/^bekrefter verkets tilleggsopplysninger uten endringer er korrekte$/) do
  @site.WorkFlow.nextStep
  @site.WorkFlow.assertSelectedTab("Beskriv verket")
  @browser.select(:data_automation_id => "Work_http://#{ENV['HOST']}:8005/ontology#language_0").selected_options.include? @context[:work_language]
end

When(/^legger inn opplysningene om utgivelsen for hovedtittel, undertittel, år, format og språk$/) do
  @site.WorkFlow.nextStep
  @site.WorkFlow.assertSelectedTab("Beskriv utgivelsen")
  @context[:publication_title] = generateRandomString
  @site.WorkFlow.add_prop("Publication", "http://#{ENV['HOST']}:8005/ontology#mainTitle", @context[:publication_title], 0, true)
  @context[:publication_language] = "Norsk"
  @site.WorkFlow.select_prop("Publication", "http://#{ENV['HOST']}:8005/ontology#language", @context[:publication_language])
  @context[:publication_format] = "Bok"
  @site.WorkFlow.select_prop("Publication", "http://#{ENV['HOST']}:8005/ontology#format", @context[:publication_format])
end

When(/^bekrefter at utgivelsesinformasjonen er korrekt$/) do
  @site.PatronClientWorkPage.visit(@context[:identifier].split("/").last)
  step "ser jeg informasjon om verkets tittel og utgivelsesår"
end