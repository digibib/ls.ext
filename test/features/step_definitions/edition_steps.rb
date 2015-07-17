# encoding: UTF-8

When(/^jeg registrerer inn opplysninger om utgivelsen$/) do
  page = @site.RegEdition.visit
  page.add_prop('Tittel', 'Sult')
  page.add_prop('Format', 'Bok')
  page.add_prop('Språk',  'Bokmål')
end
