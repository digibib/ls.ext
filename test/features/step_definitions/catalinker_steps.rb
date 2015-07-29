# encoding: UTF-8

Given(/^at det finnes et verk$/) do
  steps %Q{
   Gitt at jeg er i katalogiseringsgrensesnittet
   Så leverer systemet en ny ID for det nye verket
   Og jeg kan legge til tittel for det nye verket
   Når jeg legger til et årstall for førsteutgave av nye verket
   Så grensesnittet viser at tittelen er lagret
  }
end

Given(/^at det finnes et verk med biblio-kobling$/) do
  step "at det finnes et verk"
  @site.RegWork.add_prop("http://192.168.50.12:8005/ontology#biblio", @context[:biblio])
  step "grensesnittet viser at tittelen er lagret"
end

Given(/^at det finnes et eksemplar av en bok registrert i Koha/) do
  steps %Q{
    Gitt at jeg er logget inn som adminbruker
    Gitt at det finnes en avdeling
    Når jeg legger til en materialtype
  }
  book = SVC::Biblio.new(@browser,@context,@active).add
  @active[:book] = book
  @context[:biblio]     = book.biblionumber
  @cleanup.push( "bok #{book.biblionumber}" =>
    lambda do
      SVC::Biblio.new(@browser).delete(book)
    end
  )
end

Given(/^at jeg er i katalogiseringsgrensesnittet$/) do
  @site.RegWork.visit
end

Given(/^at det er en feil i systemet for katalogisering$/) do
  `ssh 192.168.50.12 -o UserKnownHostsFile=/dev/null -o StrictHostKeyChecking=no 'sudo docker stop redef_services_container' >&2`
  @cleanup.push("restarting redef_services_container" =>
    lambda do
      `ssh 192.168.50.12 -o UserKnownHostsFile=/dev/null -o StrictHostKeyChecking=no 'sudo docker start redef_services_container' >&2`
      sleep 15 # give container time to get up running properly for next tests
    end
    )
end

Given(/^at systemet har returnert en ny ID for det nye verket$/) do
  step "leverer systemet en ny ID for det nye verket"
end

Given(/^at det er en feil i systemet som behandler katalogisering$/) do
  pending # express the regexp above with the code you wish you had
end

Given(/^at verket har en tittel$/) do
  step "jeg kan legge til tittel for det nye verket"
  step "grensesnittet viser at tittelen er lagret"
end

Given(/^at det finnes et verk med feil årstall$/) do
  step "at jeg er i katalogiseringsgrensesnittet"
  step "at systemet har returnert en ny ID for det nye verket"
  step "jeg legger til et årstall for førsteutgave av nye verket"
end

Given(/^at jeg ser på et lagret verk$/) do
  step "at jeg er i katalogiseringsgrensesnittet"
  step "at systemet har returnert en ny ID for det nye verket"
  step "jeg kan legge til tittel for det nye verket"
  step "grensesnittet viser at tittelen er lagret"
end

Gitt(/^at jeg ser på et lagret verk med biblio\-koblinger$/) do
  step "at det finnes et eksemplar av en bok registrert i Koha"
  step "at jeg er i katalogiseringsgrensesnittet"
  step "at jeg ser på et lagret verk"
  @site.RegWork.add_prop("http://192.168.50.12:8005/ontology#biblio", @context[:biblio])
end

Given(/^at det finnes en utgivelse$/) do
  step "jeg registrerer inn opplysninger om utgivelsen"
  step "jeg knytter utgivelsen til verket"
end

When(/^jeg klikker på lenken til en biblio\-kobling$/) do
  @browser.goto(@browser.div(:class => "http://192.168.50.12:8005/ontology#biblio").a(:class => "link").href)
end

When(/^jeg klikker på lenken til verks\-siden$/) do
  @browser.goto(@site.RegWork.get_link)
end

Then(/^kommer jeg til Koha's presentasjon av biblio$/) do
  step "verkets tittel vises på verks-siden"
end

When(/^jeg åpner verket for redigering$/) do
  @site.RegWork.open(@context[:identifier], "work")
end

When(/^når jeg endrer årstall for førsteutgave til verket$/) do
  step "jeg legger til et årstall for førsteutgave av nye verket"
  step "grensesnittet viser at tittelen er lagret"
end

When(/^jeg legger til en inn alternativ tittel på det nye verket$/) do
  predicate = "http://192.168.50.12:8005/ontology#name"
  @context[:alt_title] = generateRandomString
  @browser.div(:class => predicate).button.click
  @site.RegWork.add_prop(predicate, @context[:alt_title], 1)
end

When(/^jeg legger til tittel for det nye verket$/) do
  step "jeg kan legge til tittel for det nye verket"
end

When(/^jeg vil legge til et nytt verk$/) do
  true
end

When(/^jeg forsøker å registrere ett nytt verk$/) do
  step "jeg kan legge til tittel for det nye verket"
end

When(/^jeg velger språk for tittelen$/) do
  predicate = "http://192.168.50.12:8005/ontology#name"
  @context[:title_lang] = "no"
  @browser.div(:class => predicate).select.select_value(@context[:title_lang])
end

When(/^jeg legger til et årstall for førsteutgave av nye verket$/) do
  @context[:year] = rand(2015).to_s
  @site.RegWork.add_prop("http://192.168.50.12:8005/ontology#year", @context[:year])
end

When(/^jeg legger inn "(.*?)" i feltet for førsteutgave av verket$/) do |arg1|
  @context[:year] = arg1
  @site.RegWork.add_prop("http://192.168.50.12:8005/ontology#year", @context[:year])
end

When(/^jeg legger til et eksemplar av utgivelsen$/) do
  pending # express the regexp above with the code you wish you had
end

Then(/^vises eksemplaret på verkssiden$/) do
  pending # express the regexp above with the code you wish you had
end

Then(/^viser systemet at "(.*?)" ikke er ett gyldig årstall$/) do |arg1|
  @browser.element(:text => "ugyldig input").present?
end

Then(/^viser systemet at årstall for førsteutgave av verket har blitt registrert$/) do
   step "grensesnittet viser at tittelen er lagret"
end

Then(/^viser systemet at språket til tittelen blitt registrert$/) do
  step "grensesnittet viser at tittelen er lagret"
end

Then(/^leverer systemet en ny ID for det nye verket$/) do
  @context[:identifier] = @site.RegWork.get_id()
  @context[:identifier].should_not be_empty
end

Then(/^jeg kan legge til tittel for det nye verket$/) do
  @context[:title] = generateRandomString
  @site.RegWork.add_prop("http://192.168.50.12:8005/ontology#name", @context[:title])
end

Then(/^grensesnittet viser at tittelen er lagret$/) do
  Watir::Wait.until { @browser.div(:id => /save-stat/).text === "alle endringer er lagret" }
end

Then(/^får jeg beskjed om at noe er feil$/) do
  @site.RegWork.errors.should include("Noe gikk galt!")
end

Then(/^ser jeg en liste over eksemplarer knyttet til verket$/) do
  @browser.refresh
  @site.PatronClient.existsExemplar().should == true
end

Then(/^viser systemet at tittel på verket har blitt registrert$/) do
  step "grensesnittet viser at tittelen er lagret"
end

Then(/^viser systemet at alternativ tittel på verket har blitt registrert$/) do
  step "grensesnittet viser at tittelen er lagret"
end

When(/^jeg registrerer inn opplysninger om utgivelsen$/) do
  page = @site.RegPublication.visit

  @context[:publication_format] = 'Bok'
  @context[:publication_language] = 'Bokmål'
  @context[:publication_name] = 'Blæh'

  page.add_prop('http://192.168.50.12:8005/ontology#format', @context[:publication_format])
  page.add_prop('http://192.168.50.12:8005/ontology#language', @context[:publication_language])
  page.add_prop('http://192.168.50.12:8005/ontology#name', @context[:publication_name])
end


When(/^jeg knytter utgivelsen til verket$/) do
  page = @site.RegPublication
  page.add_prop('http://192.168.50.12:8005/ontology#publicationOf', @context[:identifier])
end
