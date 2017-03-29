# encoding: UTF-8
require 'uri'
require 'net/http'

# TODO rewrite to use TestSetup and REMOVE
Given(/^at det finnes et verk$/) do
  steps %Q{
   Gitt at jeg er i katalogiseringsgrensesnittet
   Så leverer systemet en ny ID for det nye verket
   Og jeg kan legge til tittel for det nye verket
   Når jeg legger til et årstall for førsteutgave av nye verket
   Så grensesnittet viser at endringene er lagret
  }
end

Given(/^at jeg er i katalogiseringsgrensesnittet$/) do
  @site.RegWork.visit
end

Given(/^at systemet har returnert en ny ID for det nye verket$/) do
  step "leverer systemet en ny ID for det nye verket"
end

Given(/^at verket har en tittel$/) do
  step "jeg kan legge til tittel for det nye verket"
  step "grensesnittet viser at endringene er lagret"
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
  step "grensesnittet viser at endringene er lagret"
end

Given(/^at det finnes en utgivelse uten verk$/) do
  step "jeg registrerer inn opplysninger om utgivelsen"
end

When(/^jeg ser på utgivelsen i katalogiseringsgrensesnittet$/) do
  true
end

When(/^jeg klikker på lenken til en biblio\-kobling$/) do
  @browser.goto(@browser.a(:class => "biblio_record_link").href)
end

When(/^jeg klikker på lenken til verks\-siden$/) do
  @browser.goto(@site.RegWork.get_link)
end

When(/^jeg følger lenken til posten i Koha$/) do
  link = @browser.a(:data_automation_id => "biblio_record_link").href
  steps %Q{
    Gitt at jeg er logget inn som adminbruker
    Gitt at det finnes en avdeling
  }
  @browser.goto(@browser.url[0..@browser.url.index("/cgi-bin")] + link[link.index("/cgi-bin")+1..-1])
end

When(/^jeg åpner utgivelsen i gammelt katalogiseringsgrensesnitt$/) do
  unless (@context[:publication_identifier])
    fail 'No publication identifier added to context'
  end
  step 'jeg åpner utgivelsen for lesing'
end

When(/^jeg åpner verket i gammelt katalogiseringsgrensesnitt$/) do
  unless (@context[:work_identifier])
    fail 'No work identifier added to context'
  end
  step 'jeg åpner verket for redigering'
end

When(/^jeg åpner verket for redigering$/) do
  uri = @context[:work_identifier] ?
    @context[:work_identifier] :
    @context[:services].works[0].uri
  @site.RegWork.open(uri, "work")
end

When(/^jeg åpner verket for lesing$/) do
  @site.RegWork.open_readonly(@context[:work_identifier], "work")
end

When(/^jeg åpner utgivelsen for redigering$/) do
  uri = @context[:publication_identifier] ?
    @context[:publication_identifier] :
    @context[:services].publications[0].uri
  @site.RegPublication.open(uri)
end

When(/^jeg åpner utgivelsen for lesing$/) do
  @site.RegPublication.open_readonly(@context[:publication_identifier])
end

When(/^når jeg endrer årstall for førsteutgave til verket$/) do
  step "jeg legger til et årstall for førsteutgave av nye verket"
  step "grensesnittet viser at endringene er lagret"
end

When(/^jeg legger til en inn alternativ tittel på det nye verket$/) do
  predicate = "http://data.deichman.no/ontology#mainTitle"
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
  @context[:work_maintitle] = generateRandomString
  @site.RegWork.add_prop_skip_wait("http://data.deichman.no/ontology#mainTitle", @context[:work_maintitle])
end

When(/^jeg velger språk for tittelen$/) do
  predicate = "http://data.deichman.no/ontology#mainTitle"
  @context[:title_lang] = "no"
  @browser.div(:class => predicate).select.select_value(@context[:title_lang])
end

When(/^jeg legger til et årstall for førsteutgave av nye verket$/) do
  @context[:work_publicationyear] = (rand(1015)+1000).to_s
  @site.RegWork.add_prop("http://data.deichman.no/ontology#publicationYear", @context[:work_publicationyear])
end

When(/^jeg sletter eksisterende forfatter på verket$/) do
  tries = 3
  begin
    deletables = @browser.inputs(:class => 'deletable').size
    @browser.inputs(:data_automation_id => "http://data.deichman.no/ontology#creator"+"_0").first.click
    Watir::Wait.until(timeout: BROWSER_WAIT_TIMEOUT) { @browser.inputs(:class => 'deletable').size == deletables - 1 } #Allow some time for the UI to update after clicking the red X
  rescue Watir::Wait::TimeoutError
    STDERR.puts "TIMEOUT: retrying .... #{(tries -= 1)}"
    if (tries == 0)
      fail
    else
      retry
    end
  end

  # delete contribution bnode
  client = ServicesAPIClient.new()
  statements = Array.new
  bnode = RDF::Node.new()
  statements.push(
    RDF::Statement.new(
        RDF::URI.new(@context[:work_identifier]),
        RDF::URI.new("http://data.deichman.no/ontology#contributor"),
        bnode
      )
    )
  statements.push(
    RDF::Statement.new(
        bnode,
        RDF::URI.new("http://www.w3.org/1999/02/22-rdf-syntax-ns#type"),
        RDF::URI.new("http://data.deichman.no/ontology#Contribution"),
      )
    )
  statements.push(
    RDF::Statement.new(
        bnode,
        RDF::URI.new("http://www.w3.org/1999/02/22-rdf-syntax-ns#type"),
        RDF::URI.new("http://data.deichman.no/ontology#MainEntry"),
      )
    )
  statements.push(
    RDF::Statement.new(
        bnode,
        RDF::URI.new("http://data.deichman.no/ontology#agent"),
        RDF::URI.new(@context[:person_identifier])
      )
    )
  statements.push(
    RDF::Statement.new(
        bnode,
        RDF::URI.new("http://data.deichman.no/ontology#role"),
        RDF::URI.new("http://data.deichman.no/role#author")
      )
    )
  client.patch_resource(@context[:work_identifier], statements, "del")
end

When(/^jeg legger til forfatter av det nye verket$/) do
  step "jeg søker på navn til opphavsperson for det nye verket"
  step "velger person fra en treffliste"
end

When(/^jeg søker på navn til opphavsperson for det nye verket$/) do
  tries = 3
  begin
    @site.RegWork.search_resource("http://data.deichman.no/ontology#creator", @context[:person_name])
    Watir::Wait.until(timeout: BROWSER_WAIT_TIMEOUT) { @browser.div(:data_automation_id => @context[:person_identifier]) }
  rescue Watir::Wait::TimeoutError
    STDERR.puts "TIMEOUT: retrying .... #{(tries -= 1)}"
    if (tries == 0)
      fail
    else
      retry
    end
  end
end

When(/^velger person fra en treffliste$/) do
  @site.RegWork.select_resource(@context[:person_identifier].to_s)
  @context[:work_creator] = @context[:person_name]
  # Rewrite to patch work creating a bnode contribution
  client = ServicesAPIClient.new()
  statements = Array.new
  bnode = RDF::Node.new()
  statements.push(
    RDF::Statement.new(
        RDF::URI.new(@context[:work_identifier]),
        RDF::URI.new("http://data.deichman.no/ontology#contributor"),
        bnode
      )
    )
  statements.push(
    RDF::Statement.new(
        bnode,
        RDF::URI.new("http://www.w3.org/1999/02/22-rdf-syntax-ns#type"),
        RDF::URI.new("http://data.deichman.no/ontology#Contribution"),
      )
    )
  statements.push(
    RDF::Statement.new(
        bnode,
        RDF::URI.new("http://www.w3.org/1999/02/22-rdf-syntax-ns#type"),
        RDF::URI.new("http://data.deichman.no/ontology#MainEntry"),
      )
    )
  statements.push(
    RDF::Statement.new(
        bnode,
        RDF::URI.new("http://data.deichman.no/ontology#agent"),
        RDF::URI.new(@context[:person_identifier])
      )
    )
  statements.push(
    RDF::Statement.new(
        bnode,
        RDF::URI.new("http://data.deichman.no/ontology#role"),
        RDF::URI.new("http://data.deichman.no/role#author")
      )
    )
  client.patch_resource(@context[:work_identifier], statements)
end

When(/^jeg legger inn "(.*?)" i feltet for førsteutgave av verket$/) do |arg1|
  @context[:work_publicationyear] = arg1
  @site.RegWork.add_prop_skip_wait("http://data.deichman.no/ontology#publicationYear", @context[:work_publicationyear])
end

When(/^jeg legger til et eksemplar av utgivelsen$/) do
  pending # express the regexp above with the code you wish you had
end

When(/^jeg vil katalogisere en utgivelse$/) do
  @site.RegPublication.visit
end

Then(/^får utgivelsen tildelt en post\-ID i Koha$/) do
  @context[:publication_recordid] = @site.RegPublication.get_record_id
  @context[:publication_recordid].should_not be_empty
end

Then(/^det vises en lenke til posten i Koha i katalogiseringsgrensesnittet$/) do
  link = @browser.a(:data_automation_id => "biblio_record_link")
  link.href.end_with?("biblionumber=#{@context[:publication_recordid]}").should be true
end

Then(/^viser systemet at "(.*?)" ikke er ett gyldig årstall$/) do |arg1|
  @browser.element(:text => "ugyldig input").present?
end

Then(/^viser systemet at årstall for førsteutgave av verket har blitt registrert$/) do
  step "grensesnittet viser at endringene er lagret"
end

Then(/^viser systemet at språket til tittelen blitt registrert$/) do
  step "grensesnittet viser at endringene er lagret"
end

Then(/^leverer systemet en ny ID for det nye verket$/) do
  @context[:work_identifier] = @site.RegWork.get_id()
  @context[:work_identifier].should_not be_empty
end

Then(/^jeg kan legge til tittel for det nye verket$/) do
  @context[:work_maintitle] = generateRandomString
  @site.RegWork.add_prop("http://data.deichman.no/ontology#mainTitle", @context[:work_maintitle])
end

Then(/^jeg kan dikte opp en verkstittel$/) do
  @context[:work_maintitle] = generateRandomString
end

Then(/^jeg kan legge til tittelen for det nye verket$/) do
  @site.RegWork.add_prop("http://data.deichman.no/ontology#mainTitle", @context[:work_maintitle])
end

Then(/^jeg kan legge til undertittel for det nye verket$/) do
  @context[:work_subtitle] = generateRandomString
  @site.RegWork.add_prop("http://data.deichman.no/ontology#subtitle", @context[:work_subtitle])
end

Then(/^jeg kan legge til språk for det nye verket$/) do
  @context[:work_lang] = "http://lexvo.org/id/iso639-3/nob"
  @context[:work_lang_label] = "Norsk (bokmål)"
  @site.RegWork.select_prop("http://data.deichman.no/ontology#language", @context[:work_lang_label])
end

Then(/^jeg kan legge til tittel for den nye utgivelsen$/) do
  @context[:publication_maintitle] = generateRandomString
  @site.RegPublication.add_prop("http://data.deichman.no/ontology#mainTitle", @context[:publication_maintitle])
end

Then(/^jeg kan legge til tittel med tre ledd for utgivelsen$/) do
  @context[:publication_maintitle] = [generateRandomString, generateRandomString, generateRandomString].join(' ')
  @site.RegPublication.add_prop("http://data.deichman.no/ontology#mainTitle", @context[:publication_maintitle])
end

Then(/^grensesnittet viser at endringene er lagret$/) do
  Watir::Wait.until(timeout: BROWSER_WAIT_TIMEOUT) { @browser.div(:id => /save-stat/).text === "alle endringer er lagret" }
end

Then(/^får jeg beskjed om at noe er feil$/) do
  @site.RegWork.errors.should include("Noe gikk galt!")
end

Then(/^viser systemet at tittel på verket har blitt registrert$/) do
  step "grensesnittet viser at endringene er lagret"
end

Then(/^viser systemet at alternativ tittel på verket har blitt registrert$/) do
  step "grensesnittet viser at endringene er lagret"
end

When(/^jeg registrerer inn opplysninger om utgivelsen$/) do
  page = nil
  if @browser.driver.browser == :phantomjs
    # Because phantomjs caches redirects, we need to perform the get request ourself,
    # store the URI and then open it:
    res = Net::HTTP.get_response(URI(catalinker("publication")))
    uri = res['location'][res['location'].index("resource=")+9..-1]
    page = @site.RegPublication.open(uri)
  else
    page = @site.RegPublication.visit
  end

  @context[:publication_identifier] = @site.RegPublication.get_link
  @context[:publication_format] = ['CD', 'DVD', 'Kassett', 'Blu-ray'].sample
  @context[:publication_format_label] = @context[:publication_format]
  @context[:publication_language] = ['Engelsk', 'Norsk (bokmål)', 'Finsk', 'Baskisk', 'Grønlandsk'].sample
  @context[:publication_language_label] = @context[:publication_language]
  @context[:publication_maintitle] = generateRandomString
  step "får utgivelsen tildelt en post-ID i Koha"

  page.select_prop("http://data.deichman.no/ontology#format", @context[:publication_format])
  page.select_prop("http://data.deichman.no/ontology#language", @context[:publication_language])
  page.add_prop("http://data.deichman.no/ontology#mainTitle", @context[:publication_maintitle])
end


When(/^jeg knytter utgivelsen til verket$/) do
  page = @site.RegPublication
  page.add_prop("http://data.deichman.no/ontology#publicationOf", @context[:work_identifier])
end

Given(/^at jeg er i personregistergrensesnittet$/) do
  @site.RegPerson.visit
end

When(/^jeg vil legge til en person$/) do
  true
end

When(/^jeg vil lage et nytt sted$/) do
  @site.RegPlace.visit
end

When(/^jeg vil lage en ny serie/) do
  @site.RegSerial.visit
end

When(/^jeg vil lage en ny verksserie/) do
  @site.RegWorkSeries.visit
end

When(/^jeg vil lage et nytt emne/) do
  @site.RegSubject.visit
end

When(/^jeg vil lage en ny organisasjon/) do
  @site.RegCorporation.visit
end

When(/^leverer systemet en ny ID for den nye personen$/) do
  @context[:person_identifier] = @site.RegPerson.get_id()
  @context[:person_identifier].should_not be_empty
end

When(/^leverer systemet en ny ID for det nye stedet$/) do
  @context[:hasplaceofpublication_identifier] = @site.RegPlace.get_id()
  @context[:hasplaceofpublication_identifier].should_not be_empty
end

When(/^leverer systemet en ny ID for den nye serien/) do
  @context[:serial_identifier] = @site.RegSerial.get_id()
  @context[:serial_identifier].should_not be_empty
end

When(/^leverer systemet en ny ID for den nye verksserien/) do
  @context[:work_series_identifier] = @site.RegWorkSeries.get_id()
  @context[:work_series_identifier].should_not be_empty
end

When(/^leverer systemet en ny ID for det nye emnet/) do
  @context[:subject_identifier] = @site.RegSubject.get_id()
  @context[:subject_identifier].should_not be_empty
end

When(/^leverer systemet en ny ID for den nye organisasjonen/) do
  @context[:corporation_identifier] = @site.RegCorporation.get_id()
  @context[:corporation_identifier].should_not be_empty
  @context[:publishedby_identifier] = @context[:corporation_identifier]
end

When(/^jeg kan legge inn navn fødselsår og dødsår for personen$/) do
  @context[:person_name] = generateRandomString
  @site.RegPerson.add_prop("http://data.deichman.no/ontology#name", @context[:person_name])

  @context[:person_birthyear] = (1000 + rand(1015)).to_s
  @site.RegPerson.add_prop("http://data.deichman.no/ontology#birthYear", @context[:person_birthyear])

  @context[:person_deathyear] = (1000 + rand(1015)).to_s
  @site.RegPerson.add_prop("http://data.deichman.no/ontology#deathYear", @context[:person_deathyear])
end

When(/^jeg kan legge inn stedsnavn og land$/) do
  @context[:placeofpublication_place] = generateRandomString
  @site.RegPlace.add_prop("http://data.deichman.no/ontology#prefLabel", @context[:placeofpublication_place])
  @context[:placeofpublication_country] = generateRandomString
  @site.RegPlace.add_prop("http://data.deichman.no/ontology#specification", @context[:placeofpublication_country])
end

When(/^jeg kan legge inn nasjonalitet for personen$/) do
  @context[:person_nationality] = ['Norge', 'England', 'Færøyene'].sample
  @site.RegPerson.select_prop("http://data.deichman.no/ontology#nationality", @context[:person_nationality])
end


When(/^grensesnittet viser at personen er lagret$/) do
  Watir::Wait.until(timeout: BROWSER_WAIT_TIMEOUT) { @browser.div(:id => /save-stat/).text === "alle endringer er lagret" }
end

When(/^jeg klikker på linken ved urien kommer jeg til personsiden$/) do
  @browser.goto(@site.RegPerson.get_link)
end

When(/^personens navn vises på personsiden$/) do
  Watir::Wait.until(timeout: BROWSER_WAIT_TIMEOUT) { @site.PatronClientPersonPage.getPersonName.include? @context[:person_name] }
end

# TODO: remove
When(/^at jeg har lagt til en person$/) do
  steps %Q{
    Gitt at jeg er i personregistergrensesnittet
    Så leverer systemet en ny ID for den nye personen
    Og jeg kan legge inn navn fødselsår og dødsår for personen
    Og jeg kan legge inn nasjonalitet for personen
  }
end

When(/^viser systemet at opphavsperson til verket har blitt registrert$/) do
  step "grensesnittet viser at endringene er lagret"
end

# TODO REMOVE
#When(/^når jeg endrer tittelen på utgivelsen$/) do
#  step "jeg kan legge til tittel for den nye utgivelsen"
#  step "grensesnittet viser at endringene er lagret"
#end

# TODO REMOVE
#When(/^når jeg endrer tittelen på verket$/) do
#  step "jeg kan legge til tittel for det nye verket"
#  step "grensesnittet viser at endringene er lagret"
#end

# TODO REMOVE
#When(/^når jeg endrer navnet på personen$/) do
#  @context[:person_name] = generateRandomString
#  @context[:work_creator] = @context[:person_name]
#  @site.RegPerson.add_prop("http://data.deichman.no/ontology#name", @context[:person_name])
#  step "grensesnittet viser at endringene er lagret"
#end

# TODO REMOVE
#When(/^jeg endrer forfatteren på verket$/) do
#  step "jeg sletter eksisterende forfatter på verket"
#  step "at det finnes en personressurs"
#  @site.CatalinkerPage.open(@context[:work_identifier], "work")
#  step "jeg legger til forfatter av det nye verket"
#  step "grensesnittet viser at endringene er lagret"
#end

When(/^viser trefflisten at personen har et verk fra før$/) do
  Watir::Wait.until(timeout: BROWSER_WAIT_TIMEOUT) { @browser.span(:class => "search-result-name", :text => @context[:person_name]).exists? }
end

When(/^trefflisten viser at personen har riktig nasjonalitet$/) do
  # TODO nasjonalitet er nå indeksert med uri
  #Watir::Wait.until(timeout: BROWSER_WAIT_TIMEOUT) { @browser.span(:class => "nationality", :text => @context[:person_nationality]).exists? }
end

When(/^trefflisten viser at personen har riktig levetid$/) do
  Watir::Wait.until(timeout: BROWSER_WAIT_TIMEOUT) { @browser.span(:class => "birthYear", :text => @context[:person_birthyear]).exists? }
  Watir::Wait.until(timeout: BROWSER_WAIT_TIMEOUT) { @browser.span(:class => "deathYear", :text => @context[:person_deathyear]).exists? }
end

When(/^jeg verifiserer opplysningene om utgivelsen$/) do
  # TODO: Unify get_prop and get_select_prop in the page objects to avoid having to specify it.
  data = Hash.new
  data['publicationYear'] = :get_prop_from_span
  data['format'] = :get_prop_from_span
  data['partTitle'] = :get_prop_from_span
  data['partNumber'] = :get_prop_from_span
  data['edition'] = :get_prop_from_span
  data['numberOfPages'] = :get_prop_from_span
  data['isbn'] = :get_prop_from_span
  data['illustrativeMatter'] = :get_prop_from_span
  data['hasFormatAdaptation'] = :get_prop_from_span
  data['binding'] = :get_prop_from_span
  data['writingSystem'] = :get_prop_from_span

  batch_verify_props @site.RegPublication, 'Publication', data
end

def batch_verify_props(page_object, domain, data, locate_by = 'locate_by_fragment'.to_sym)
  @browser.refresh
  sleep 4
  data.each do |id, method|
    if locate_by == :locate_by_fragment
      symbol = "#{domain.downcase}_#{id.downcase}".to_sym # e.g. :publication_format
      inputLocator = "http://data.deichman.no/ontology##{id}"
    else
      symbol = id
      inputLocator = id
    end

    begin
      expected_value = @context[symbol] || @context["#{id.downcase}_identifier".to_sym]
      if expected_value.kind_of?(Array)
        actual_values = Array.new
        expected_value.length.times do |index|
          actual_values.push page_object.method(method).call(inputLocator, index)
        end
        actual_values.should=~expected_value
      else
        page_object.method(method).call(inputLocator).should eq expected_value
      end
    rescue
      fail "Failed getting field for #{id} with #{method} and #{inputLocator}"
    end
    fail "More than one field for #{id}" if page_object.get_prop_count(inputLocator && !expected_value.kind_of?(Array)) > 1
  end
end

When(/^jeg verifiserer opplysningene om verket$/) do
  data = Hash.new
  data['mainTitle'] = :get_prop
  data['subtitle'] = :get_prop
  data['publicationYear'] = :get_prop
  data['language'] = :get_select_prop

  batch_verify_props @site.RegWork, 'Work', data
end

def verify_fragment(fragment, prop_get_method)
  resource_type = @browser.span(:id, "resource-type").attribute_value("data-resource-type")
  data = Hash.new
  data[fragment] = prop_get_method
  batch_verify_props @site.RegWork, resource_type, data, :locate_by_label
end

def verify_by_label(label, prop_get_method)
  resource_type = @browser.span(:id, "resource-type").attribute_value("data-resource-type")
  data = Hash.new
  data[label] = prop_get_method
  batch_verify_props @site.RegWork, resource_type, data, :locate_by_label
end

When(/^verifiserer jeg innskrevet verdi for "([^"]*)"$/) do |label|
  verify_fragment(label, :get_prop_by_label)
end

When(/^verifiserer jeg innskrevet verdi for "([^"]*)", som i gammelt grensesnitt heter "([^"]*)"$/) do |label, old_label|
  @context[old_label] = @context[label]
  verify_fragment(old_label, :get_prop_by_label)
end

When(/^verifiserer jeg valgt verdi for "([^"]*)"$/) do |label|
  verify_fragment(label, :get_select_prop_by_label)
end

When(/^verifiserer jeg valgte verdier for "([^"]*)"$/) do |label|
  verify_fragment(label, :get_select_prop_by_label)
end

When(/^at utgivelsen er tilkoplet riktig (.*)$/) do |concept|
  data = Hash.new
  data[@site.translate(concept)] = :get_prop_from_span
  batch_verify_props @site.RegPublication, 'Publication', data, :locate_by_fragment
  end

When(/^at verket er tilkoplet riktig (.*)$/) do |concept|
  data = Hash.new
  data[@site.translate(concept)] = :get_prop_from_span
  batch_verify_props @site.RegWork, 'Work', data, :locate_by_fragment
end

When(/^at utgivelsen har samme (.*) som verket$/) do |field|
  data = Hash.new
  data[@site.translate(field)] = :get_prop_from_span
  batch_verify_props @site.RegPublication, 'Work', data, :locate_by_fragment
end

When(/^at jeg vil lage en person til$/) do
  # nop
end