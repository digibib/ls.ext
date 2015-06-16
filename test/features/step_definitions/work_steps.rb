# encoding: UTF-8

Given(/^at det finnes et verk$/) do
  @context[:title]      = generateRandomString
  @context[:author]     = generateRandomString
  @context[:date]       = String(rand(9999))

  @site.Catalinker.visit
  page = @site.Catalinker.add(@context[:title],@context[:author],@context[:date],@context[:biblio])
  @context[:identifier] = page.get_id
end

Given(/^at det finnes et verk \(ny klient\)$/) do
  @context[:title]      = generateRandomString
  @context[:author]     = generateRandomString
  @context[:date]       = String(rand(9999))

  @site.CatalinkerClient.visit
  page = @site.CatalinkerClient.add(@context[:title],@context[:author],@context[:date],@context[:biblio])
  @context[:identifier] = page.get_id
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

When(/^jeg er på sida til verket$/) do
  @site.PatronClient.visit(@context[:identifier])
end

Then(/^ser jeg informasjon om verkets tittel og utgivelsesår$/) do
  @site.PatronClient.getTitle.should include(@context[:title])
  @site.PatronClient.getDate.should include(@context[:date])
end

Then(/^ser jeg en liste over eksemplarer knyttet til verket$/) do
  @site.PatronClient.existsExemplar().should == true
end
