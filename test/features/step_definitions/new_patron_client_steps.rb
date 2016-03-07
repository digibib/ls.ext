require 'cgi'

When(/^at jeg er i søkegrensesnittet$/) do
  @site.SearchPatronClient.visit
end

When(/^jeg søker på "([^"]*)" \(\+ id på vilkårlig migrering\)$/) do |query|
  @site.SearchPatronClient.search_with_text "#{query}#{@context[:random_migrate_id]}"
end

When(/^skal jeg få "([^"]*)" treff$/) do |hits|
  wait_for { @browser.element(data_automation_id: 'hits-total').text.eql? hits }
end

When(/^jeg går til side "([^"]*)" i resultatlisten$/) do |page|
  pagination_element = @browser.element(class: 'pagination').a(text: page)
  wait_for { pagination_element.exists? }
  unless pagination_element.parent.class_name.eql? 'active'
    pagination_element.click
  end
  wait_for { @browser.element(class: 'pagination').a(text: page).parent.class_name.eql? 'active' }
  wait_for { CGI::parse(URI(@browser.url).query)['page'].include? page }
end

When(/^skal jeg ha "([^"]*)" resultater og være på side "([^"]*)"$/) do |hits, page|
  wait_for { @browser.element(class: 'pagination').a(text: page).parent.class_name.eql? 'active' }
  wait_for { @browser.element(data_automation_id: 'hits-total').exists? }
  wait_for { @browser.div(data_automation_id: 'search-result-entries').elements(:xpath, '*').count.to_s.eql? hits }
end

When(/^jeg trykker tilbake i nettleseren$/) do
  sleep 1 # Avoids snags in PhantomJS
  @browser.back
end

When(/^jeg trykker fremover i nettleseren$/) do
  sleep 1 # Avoids snags in PhantomJS
  @browser.forward
end

When(/^skal jeg se filtre på format og språk$/) do
  wait_for { @browser.element(data_automation_id: 'filter_work.publication.format').exists? }
  wait_for { @browser.element(data_automation_id: 'filter_work.publication.language').exists? }
end

When(/^jeg slår på et filter for et vilkårlig format$/) do
  @browser.element(data_automation_id: 'filter_work.publication.format').checkboxes.to_a.select { |checkbox| not checkbox.set? }.sample.set
end

When(/^skal jeg kun se treff med valgte format tilgjengelig$/) do
  filter_values = CGI::parse(URI(@browser.url).query)['filter_work.publication.format']
  @browser.div(data_automation_id: 'search-result-entries').elements(:xpath, '*').each do |element|
    match = false
    filter_values.each do |filter_value|
      if element.text.include? filter_value
        match = true
      end
    end
    match.should eq true
  end
end

When(/^skal filterne være valgt i grensesnittet$/) do
  filters = CGI::parse(URI(@browser.url).query).select { |param| param.start_with? 'filter_' }
  data_automation_ids = filters.map { |aggregation, buckets| buckets.map { |bucket| "#{aggregation}_#{bucket}" } }.flatten
  filters.each do |filter, _|
    element = @browser.element(data_automation_id: filter)
    element.lis.select do |filter|
      if data_automation_ids.include? filter.attribute_value(:data_automation_id)
        filter.checkbox.set?.should eq true
      end
    end
  end
end

When(/^nåværende søketerm skal være "([^"]*)" \(\+ id på vilkårlig migrering\)$/) do |query|
  wait_for { @browser.element(data_automation_id: 'current-search-term').text.eql? "#{query}#{@context[:random_migrate_id]}" }
end