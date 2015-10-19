# encoding: UTF-8

When(/^jeg søker på verket i lånergrensesnittet$/) do
  page = @site.SearchPatronClient
  page.visit
  page.search_with_text(@context[:title])
end

Then(/^vil jeg finne verket i trefflista$/) do
  result_list = @site.SearchPatronClient.get_search_result_list
  if !result_list.present?
    sleep 2 # to give elasticsearch more time to index
    step "jeg søker på verket i lånergrensesnittet"
    result_list = @site.SearchPatronClient.get_search_result_list
  end
  result_list.text.include?(@context[:title]).should == true
end

When(/^jeg søker på verkets ID i lånergrensesnittet$/) do
  page = @site.SearchPatronClient
  page.visit
  page.search_with_text(@context[:identifier])
end

Then(/^skal ikke verket finnes i trefflisten$/) do
  result_list = @site.SearchPatronClient.get_search_result_list
  result_list.exists?.should == false
end

When(/^jeg søker på verket i lånergrensesnittet basert på det første og siste leddet i tittelen$/) do
  page = @site.SearchPatronClient
  page.visit
  split_title = @context[:title].split(' ')
  search_query = [split_title.first, split_title.last].join(' ')
  page.search_with_text(search_query)
end