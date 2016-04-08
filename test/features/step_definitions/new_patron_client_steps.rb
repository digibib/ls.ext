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

When(/^jeg trykker oppfrisk i nettleseren$/) do
  @browser.refresh
end

When(/^skal jeg se filtre på format, språk og målgruppe$/) do
  wait_for { @browser.element(data_automation_id: 'filter_work.publication.format').exists? }
  wait_for { @browser.element(data_automation_id: 'filter_work.publication.language').exists? }
  wait_for { @browser.element(data_automation_id: 'filter_work.publication.audience').exists? }
end

When(/^jeg slår på et filter for et vilkårlig format$/) do
  @browser.element(data_automation_id: 'filter_work.publication.format').checkboxes.to_a.select { |checkbox| not checkbox.set? }.sample.set
end

When(/^skal jeg kun se treff med valgte format tilgjengelig$/) do
  filter_values = @browser.element(data_automation_id: 'filter_work.publication.format').lis
                      .select { |li| li.checkbox.present? && li.checkbox.set? }
                      .map { |li| li.span(data_automation_id: 'filter_label').text }
  wait_for {
    match = false
    @browser.div(data_automation_id: 'search-result-entries').elements(data_automation_id: 'work_formats').each do |element|
      filter_values.each do |filter_value|
        if element.text.include? filter_value
          match = true
        end
      end
    end
    match
  }
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
  wait_for {
    current_search_term = @browser.element(data_automation_id: 'current-search-term')
    current_search_term.present? && current_search_term.text.eql?("#{query}#{@context[:random_migrate_id]}")
  }
end

When(/^skal tittel prefikset "([^"]*)" og som inneholder "([^"]*)" vises i søkeresultatet$/) do |prefix, str|
  wait_for {
    element = @browser.element(data_automation_id: 'work-title')
    element.present? && element.text.eql?("#{prefix}#{@context[:random_migrate_id]} #{@context[:random_migrate_id]}#{str}")
  }
end

When(/^skal språket "([^"]*)" være valgt$/) do |language|
  @browser.select(class: 'languageselector').selected_options.first.text.should eq language
end

When(/^jeg velger språket "([^"]*)"$/) do |language|
  @browser.select(class: 'languageselector').select(language)
end

When(/^søkeknappen skal vise ordet "([^"]*)"$/) do |button_text|
  @browser.element(id: 'submit').text.should eq button_text
end

When(/^jeg søker på "([^"]*)"$/) do |query|
  @site.SearchPatronClient.search_with_text "#{query}"
end

When(/^jeg trykker på første treff$/) do
  wait_for { @browser.element(class: 'result-more').a.present? }
  @browser.element(class: 'result-more').a.click
end

When(/^skal jeg se "([^"]*)" utgivelser$/) do |count|
  wait_for { @browser.elements(class: 'publication-small').size.to_s.eql? count }
end

When(/^skal jeg se et panel med informasjon om utgivelsen$/) do
  wait_for { @browser.elements(data_automation_id: /^publication_info_/).size.eql? 1 } #There should only be one
end

When(/^jeg trykker på utgivelsen med "([^"]*)" språk$/) do |language|
  @browser.elements(data_automation_id: 'publication_language').select { |element| element.text.eql? language }[0].click
end

When(/^den skal inneholde eksemplarinformasjonen$/) do |table|
  publication_info = @browser.element(data_automation_id: /^publication_info_/).table
  table.diff!(publication_info.hashes).should eq nil
end

When(/^skal jeg ikke se et panel med informasjon om utgivelsen$/) do
  wait_for { @browser.elements(data_automation_id: /^publication_info_/).size.eql? 0 }
end

When(/^skal skal tittel prefikset "([^"]*)" og som inneholder "([^"]*)" vises på verkssiden$/) do |prefix, str|
  @site.PatronClientWorkPage.title.eql?("#{prefix}#{@context[:random_migrate_id]} #{@context[:random_migrate_id]}#{str}")
end

When(/^jeg trykker på krysset i boksen med utgivelsesinformasjon$/) do
  @browser.element(data_automation_id: /^close_publication_info_/).click
end