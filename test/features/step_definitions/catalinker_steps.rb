# encoding: UTF-8
require 'uri'
require 'net/http'

Given(/^at det finnes et verk$/) do
  steps %Q{
   Gitt at jeg er i katalogiseringsgrensesnittet
   Så leverer systemet en ny ID for det nye verket
   Og jeg kan legge til tittel for det nye verket
   Når jeg legger til et årstall for førsteutgave av nye verket
   Så grensesnittet viser at tittelen er lagret
  }
end

Given(/^et verk med en utgivelse$/) do
  step "at det finnes et verk"
  step "at det finnes en utgivelse"
end

Gitt(/^et verk med flere utgivelser og eksemplarer$/) do
  step "at det finnes et verk"

  # we need Koha to be set up
  steps %Q{
    Gitt at jeg er logget inn som adminbruker
    Gitt at det finnes en avdeling
    Når jeg legger til en materialtype
  }

  # Add 3 publications of the work, with 2 exemplars of each
  3.times do
    step "at det finnes en utgivelse"
    step "får utgivelsen tildelt en post-ID i Koha" # needed to store :record_id in context
    2.times do
      # create new item
      page = @site.BiblioDetail.visit(@context[:record_id])
      page.add_item_with_random_barcode_and_itemtype(@context[:itemtypes][0].desc)
    end
    record_id = @context[:record_id] # need to store it in a variable so the cleanup can close over it
    @cleanup.push( "delete items of bibilo ##{record_id}" =>
        lambda do
          page = @site.BiblioDetail.visit(record_id)
          page.delete_all_items
          # TODO: deletion of biblio will be handled by services?
        end
      )
  end
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

Given(/^at jeg ser på et lagret verk med biblio\-koblinger$/) do
  step "at det finnes et eksemplar av en bok registrert i Koha"
  step "at jeg er i katalogiseringsgrensesnittet"
  step "at jeg ser på et lagret verk"
  @site.RegWork.add_prop("http://192.168.50.12:8005/ontology#biblio", @context[:biblio])
end

Given(/^at det finnes en utgivelse$/) do
  step "jeg registrerer inn opplysninger om utgivelsen"
  step "jeg knytter utgivelsen til verket"
end

Given(/^at det finnes et verk og en utgivelse$/) do
  steps %Q{
    Gitt at det finnes et verk
    Og at det finnes en utgivelse
    Og får utgivelsen tildelt en post-ID i Koha
  }
end

When(/^jeg ser på utgivelsen i katalogiseringsgrensesnittet$/) do
  true
end

When(/^jeg klikker på lenken til en biblio\-kobling$/) do
  @browser.goto(@browser.div(:class => "http://192.168.50.12:8005/ontology#biblio").a(:class => "link").href)
end

When(/^jeg klikker på lenken til verks\-siden$/) do
  @browser.goto(@site.RegWork.get_link)
end

When(/^jeg følger lenken til posten i Koha$/) do
  link = @browser.div(:class => "http://192.168.50.12:8005/ontology#recordID").a(:class => "link").href
  steps %Q{
    Gitt at jeg er logget inn som adminbruker
    Gitt at det finnes en avdeling
    Når jeg legger til en materialtype
  }
  @browser.goto(@browser.url[0..@browser.url.index("/cgi-bin")] + link[link.index("/cgi-bin")+1..-1])
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

When(/^jeg vil katalogisere en utgivelse$/) do
  @site.RegPublication.visit
end

When(/^jeg oppretter et eksemplar av utgivelsen$/) do
  @browser.button(:text => "New").click
  @browser.link(:id => "newitem").click
  @browser.select_list(:id => /^tag_952_subfield_y_[0-9]+$/).select(@context[:itemtypes][0].desc)
  @browser.text_field(:id => /^tag_952_subfield_p_[0-9]+$/).set('0301%010d' % rand(10 ** 10))
  @browser.button(:text => "Add item").click
  record_id = @context[:record_id]
  @cleanup.push( "delete items of bibilo ##{record_id}" =>
    lambda do
      @browser.goto intranet(:biblio_detail)+record_id

      # delete all book items
      @browser.execute_script("window.confirm = function(msg){return true;}")
      @browser.button(:text => "Edit").click
      @browser.a(:id => "deleteallitems").click

      # TODO: deletion of biblio will be handled by services?
    end
  )
end

Then(/^får utgivelsen tildelt en post\-ID i Koha$/) do
  @context[:record_id] = @site.RegPublication.get_record_id
  @context[:record_id].should_not be_empty
end

Then(/^det vises en lenke til posten i Koha i katalogiseringsgrensesnittet$/) do
  link = @browser.div(:class => "http://192.168.50.12:8005/ontology#recordID").a(:class => "link")
  link.href.end_with?("biblionumber=#{@context[:record_id]}").should be true
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

Then(/^viser systemet at tittel på verket har blitt registrert$/) do
  step "grensesnittet viser at tittelen er lagret"
end

Then(/^viser systemet at alternativ tittel på verket har blitt registrert$/) do
  step "grensesnittet viser at tittelen er lagret"
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

  @context[:publication_format] = ['Bok', 'Lydbok (CD)', 'Lydbok (Kassett)', 'E-bok', 'Bok', 'Bok'].sample
  @context[:publication_language] =  ['Engelsk','Norsk (bokmål)','Finsk','Baskisk', 'Grønlandsk'].sample
  @context[:publication_name] = generateRandomString

  page.add_prop('http://192.168.50.12:8005/ontology#format', @context[:publication_format])
  page.select_prop('http://192.168.50.12:8005/ontology#language', @context[:publication_language])
  page.add_prop('http://192.168.50.12:8005/ontology#name', @context[:publication_name])
end


When(/^jeg knytter utgivelsen til verket$/) do
  page = @site.RegPublication
  page.add_prop('http://192.168.50.12:8005/ontology#publicationOf', @context[:identifier])
end
