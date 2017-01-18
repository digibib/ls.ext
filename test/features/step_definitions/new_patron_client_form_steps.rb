When(/^jeg tester feltet "([^"]*)" for påkrevd og XSS$/) do |field|
  @site.PatronClientForms.is_required?(field)
  @site.PatronClientForms.has_xss_protection?(field)
end

When(/^jeg tester fødselsdatofeltet for gyldighetsjekk$/) do
  @site.PatronClientForms.is_required?('day')
  @site.PatronClientForms.is_invalid?('day', '0')
  @site.PatronClientForms.is_invalid?('day', '-1')
  @site.PatronClientForms.is_invalid?('day', '32')
  @site.PatronClientForms.is_invalid?('day', 'a')
  @site.PatronClientForms.is_valid?('day', '1')
  @site.PatronClientForms.is_valid?('day', '31')

  @site.PatronClientForms.is_required?('month')
  @site.PatronClientForms.is_invalid?('month', '0')
  @site.PatronClientForms.is_invalid?('month', '-1')
  @site.PatronClientForms.is_invalid?('month', '13')
  @site.PatronClientForms.is_invalid?('month', 'a')
  @site.PatronClientForms.is_valid?('month', '1')
  @site.PatronClientForms.is_valid?('month', '12')

  @site.PatronClientForms.is_required?('year')
  @site.PatronClientForms.is_invalid?('year', '0')
  @site.PatronClientForms.is_invalid?('year', '-1')
  @site.PatronClientForms.is_invalid?('year', '999')
  @site.PatronClientForms.is_invalid?('year', '1899')
  @site.PatronClientForms.is_invalid?('year', Date.today.year + 1)
  @site.PatronClientForms.is_invalid?('year', '20000')
  @site.PatronClientForms.is_invalid?('year', 'a')
  @site.PatronClientForms.is_valid?('year', '1900')
  @site.PatronClientForms.is_valid?('year', Date.today.year - 5)
end

When(/^jeg tester id\-nummerfeltet for gyldighetssjekk$/) do
  @site.PatronClientForms.is_required?('ssn')
  @site.PatronClientForms.is_invalid?('ssn', 'a')
  @site.PatronClientForms.is_invalid?('ssn', '13119788041')
  @site.PatronClientForms.is_invalid?('ssn', '15084630264')
  @site.PatronClientForms.is_invalid?('ssn', '12068425414')
  @site.PatronClientForms.is_valid?('ssn', '13119788042')
  @site.PatronClientForms.is_valid?('ssn', '15084630265')
  @site.PatronClientForms.is_valid?('ssn', '12068425415')
end

When(/^jeg sjekker om epost og mobil\/telefon valideres riktig$/) do
  @site.PatronClientForms.is_valid?('mobile', '')

  message = 'Eposten må være i et gyldig format'
  @site.PatronClientForms.triggers_message?('email', '', 'Feltet må fylles ut')
  @site.PatronClientForms.triggers_message?('email', 'a', message)
  @site.PatronClientForms.triggers_message?('email', 'a@@', message)
  @site.PatronClientForms.triggers_message?('email', '@a', message)
  @site.PatronClientForms.triggers_message?('email', '@@a', message)
  @site.PatronClientForms.triggers_message?('email', 'a@', message)
  @site.PatronClientForms.triggers_message?('email', '<script>', message)
  @site.PatronClientForms.is_valid?('email', 'a@a')

  @site.PatronClientForms.is_invalid?('mobile', 'invalid')
  @site.PatronClientForms.is_invalid?('mobile', '9999999')
  @site.PatronClientForms.is_invalid?('mobile', '999999999')
end

When(/^jeg sjekker om postnummer valideres riktig$/) do
  @site.PatronClientForms.is_required?('zipcode')
  @site.PatronClientForms.is_invalid?('zipcode', '999')
  @site.PatronClientForms.is_invalid?('zipcode', '99999')
  @site.PatronClientForms.is_invalid?('zipcode', 'a999')
  @site.PatronClientForms.is_invalid?('zipcode', 'a9999')
  @site.PatronClientForms.is_invalid?('zipcode', 'aaaa')
  @site.PatronClientForms.is_valid?('zipcode', '0000')
  @site.PatronClientForms.is_valid?('zipcode', '9999')
end

When(/^jeg sjekker at poststed valideres riktig$/) do
  @site.PatronClientForms.is_required?('city')
  @site.PatronClientForms.is_invalid?('city', 'a')
  @site.PatronClientForms.is_invalid?('city', 'a0')
  @site.PatronClientForms.is_valid?('city', 'aa')
end

When(/^jeg tester om PIN\-kode valideres riktig$/) do
  @site.PatronClientForms.is_required?('pin')
  @site.PatronClientForms.triggers_message?('pin', '999', 'PIN-koden må være 4 siffer')
  @site.PatronClientForms.triggers_message?('pin', '999a', 'PIN-koden må være 4 siffer')
  @site.PatronClientForms.triggers_message?('pin', 'aaaa', 'PIN-koden må være 4 siffer')
  @site.PatronClientForms.is_valid?('pin', '9999')
  @site.PatronClientForms.is_required?('repeatPin')
  @site.PatronClientForms.triggers_message?('repeatPin', '1111', 'PIN-kodene må være like')
  @site.PatronClientForms.is_valid?('repeatPin', '9999')
end

When(/^får jeg melding om at brukervilkårene må godkjennes$/) do
  @site.PatronClientForms.get_validator('acceptTerms').text.should eq 'Brukervilkårene må godkjennes'
end

When(/^jeg tester fornavn for påkrevd og XSS$/) do
  step 'jeg tester feltet "firstName" for påkrevd og XSS'
end

When(/^jeg tester etternavn for påkrevd og XSS$/) do
  step 'jeg tester feltet "lastName" for påkrevd og XSS'
end

When(/^jeg tester adresse for påkrevd og XSS$/) do
  step 'jeg tester feltet "address" for påkrevd og XSS'
end

