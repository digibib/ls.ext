# encoding: UTF-8

Gitt(/^jeg tar meg en matbit$/) do
  sleep 5
end

When(/^jeg søker på verket i lånergrensesnittet$/) do
  title = @context[:work_updated_title] ?
    @context[:work_updated_title] :
    @context[:services].get_value(@context[:services].publications[0], 'mainTitle')
  searchString = title.gsub(/[[:punct:]]/,'') # remove punctuation before search
  page = @site.SearchPatronClient.visit.search_with_text(searchString)
end

When(/^jeg søker på utgivelsen i lånergrensesnittet$/) do
  title = @context[:publication_maintitle] ?
    @context[:publication_maintitle] :
    @context[:services].get_value(@context[:services].publications[0], 'mainTitle')
  page = @site.SearchPatronClient.visit
    .search_with_text(title)
end

Then(/^vil jeg finne verket i trefflista$/) do
  step "jeg vil finne verket i trefflista"
end

Then(/^jeg vil finne verket i trefflista$/) do
  # TODO: REMOVE @context[:publication_maintitle]
  title = ''
  if @context[:work_updated_title]
    title = @context[:work_updated_title]
  elsif @context[:publication_maintitle]
    title = @context[:publication_maintitle]
  else
    title = @context[:services].get_value(@context[:services].publications[0], 'mainTitle')
  end
  result_list = @site.SearchPatronClient.get_search_result_list
  if result_list.length == 0
    sleep 2 # to give elasticsearch more time to index
    step "jeg søker på utgivelsen i lånergrensesnittet"
    result_list = @site.SearchPatronClient.get_search_result_list
  end
  result_text = result_list.map { |d| d.text }.join " "
  result_text.include?(title).should == true
end

When(/^søker jeg på verkets ID i lånergrensesnittet$/) do
  step "jeg søker på verkets ID i lånergrensesnittet"
end

When(/^jeg søker på verkets ID i lånergrensesnittet$/) do
  page = @site.SearchPatronClient
  page.visit
  page.search_with_text(@context[:work_identifier])
end

When(/^jeg søker på verkets forfatter i lånergrensesnittet$/) do
  # TODO: remove @context[:person_name]
  name = @context[:person_name_updated] ?
    @context[:person_name_updated] :
    @context[:person_name]
  @site.SearchPatronClient.visit.search_with_text(name)
end

Then(/^skal ikke verket finnes i trefflisten$/) do
  result_list = @site.SearchPatronClient.get_search_result_list
  result_list.length.should == 0
end

When(/^jeg søker på verket i lånergrensesnittet basert på det første og siste leddet i tittelen$/) do
  page = @site.SearchPatronClient
  page.visit
  split_title = @context[:work_maintitle].split(' ')
  search_query = [split_title.first, split_title.last].join(' ')

  page.search_with_text(search_query)
end
