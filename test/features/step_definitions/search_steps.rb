# encoding: UTF-8

When(/^jeg søker på verket i lånergrensesnittet$/) do
  page = @site.SearchPatronClient
  page.visit
  page.search_with_text(@context[:title])
end

Then(/^vil jeg finne verket i trefflista$/) do
  resultList = @site.SearchPatronClient.get_search_result_list
  if !resultList.present?
    sleep 2 # to give elasticsearch more time to index
    step "jeg søker på verket i lånergrensesnittet"
    resultList = @site.SearchPatronClient.get_search_result_list
  end
  resultList.text.include?(@context[:title]).should == true
end

When(/^jeg søker på noe som ikke finnes$/) do
  @context[:search_term] = generateRandomString
  page = @site.SearchPatronClient
  page.visit
  page.search_with_text(@context[:search_term])
end

Then(/^får jeg beskjed om at det ikke var noen treff$/) do
  @browser.span(:data_automation_id => "current-search-term").text.include?(@context[:search_term]).should == true
  @browser.span(:data_automation_id => "hits-total").text.should == "0"
end