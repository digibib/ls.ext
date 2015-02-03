# encoding: UTF-8

Given(/^det finnes en autorisert verdi for "(.*)"$/) do |category|
  @context[:authorised_value_category]    = category
  @context[:authorised_value]             = String(rand(100))
  @context[:authorised_value_description] = generateRandomString

  @site.AuthorizedValues.
      visit.
      add(@context[:authorised_value_category], @context[:authorised_value], @context[:authorised_value_description])

  @cleanup.push( "autorisert verdi #{@context[:authorised_value]} for #{@context[:authorised_value_category]}" =>
    lambda do
      @site.AuthorizedValues.
          visit.
          search(@context[:authorised_value_category]).
          delete_value @context[:authorised_value]
    end
  )
end

When(/jeg legger til en autorisert verdi/) do
  step "det finnes en autorisert verdi for \"NOT_LOAN\""
end

Then(/^kan jeg finne den autoriserte verdien i listen over autoriserte verdier$/) do
  @site.AuthorizedValues.
      visit.
      search(@context[:authorised_value_category]).
      values_text.should include @context[:authorised_value]
end
