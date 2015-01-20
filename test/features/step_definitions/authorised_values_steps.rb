# encoding: UTF-8

Given(/^det finnes en autorisert verdi$/) do
  @context[:authorised_category] = generateRandomString
  @context[:authorised_value]    = generateRandomString
  @browser.goto intranet(:authorised_values)
  @browser.a(:id => "addcat").click
  form = @browser.form(:name => "Aform")
  form.text_field(:id => "category").set @context[:authorised_category]
  form.text_field(:id => "authorised_value").set @context[:authorised_value]
  form.submit

  @cleanup.push( "autorisert verdi #{@context[:authorised_value]}" =>
    lambda do
      @browser.goto intranet(:authorised_values)
      form = @browser.form(:id => "category")
      form.select_list(:id => "searchfield").select_value @context[:authorised_category]

      table = @browser.table(:id => "table_authorized_values")
      table.rows.each do |row|
        if row.text.include?(@context[:authorised_value])
          row.link(:href => /op=delete_confirm/).click
          @browser.input(:class => "approve").click
          break
        end
      end
    end
  )
end

When(/jeg legger til en autorisert verdi/) do
  step "det finnes en autorisert verdi"
end

Then(/^kan jeg finne den autoriserte verdien i listen over autoriserte verdier$/) do
  @browser.goto intranet(:authorised_values)
  form = @browser.form(:id => "category")
  form.select_list(:id => "searchfield").include?(@context[:authorised_category]).should == true
end
