# encoding: UTF-8

Given(/^det finnes en autorisert verdi for "(.*)"$/) do |category|
  @context[:authorised_value_category]    = category
  @context[:authorised_value]             = String(rand(100))
  @context[:authorised_value_description] = generateRandomString
  @browser.goto intranet(:authorised_values)

  form = @browser.form(:id => "category")

  category_exists = form.select.include?(@context[:authorised_value_category])
  
  if category_exists
    form.select_list(:id => "searchfield").select_value @context[:authorised_value_category]
    @browser.a(:id => "addauth").click
    form = @browser.form(:name => "Aform")
  else
    @browser.a(:id => "addcat").click
    form = @browser.form(:name => "Aform")
    form.text_field(:id => "category").set @context[:authorised_value_category]
  end
  form.text_field(:id => "authorised_value").set @context[:authorised_value]
  form.text_field(:id => "lib").set @context[:authorised_value_description]
  form.submit

  @cleanup.push( "autorisert verdi #{@context[:authorised_value]} for #{@context[:authorised_value_category]}" =>
    lambda do
      @browser.goto intranet(:authorised_values)
      form = @browser.form(:id => "category")
      form.select_list(:id => "searchfield").select_value @context[:authorised_value_category]

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
  step "det finnes en autorisert verdi for \"NOT_LOAN\""
end

Then(/^kan jeg finne den autoriserte verdien i listen over autoriserte verdier$/) do
  @browser.goto intranet(:authorised_values)
  form = @browser.form(:id => "category")
  form.select_list(:id => "searchfield").select_value @context[:authorised_value_category]
  table = @browser.table(:id => "table_authorized_values")
  table.wait_until_present
  table.text.should include @context[:authorised_value]
end
