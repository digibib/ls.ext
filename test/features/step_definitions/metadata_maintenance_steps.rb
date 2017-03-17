# encoding: UTF-8
require 'faker'

Given(/^at det finnes ([0-9]) verk med ([0-9]) utgivelser og ([0-9]) personer$/) do |works,pubs,persons|
  s = TestSetup::Services.new()
  s.add_work_with_publications_and_contributors(pubs.to_i, persons.to_i)
  @context[:services] = s
  @cleanup.push( "cleaning up TestSetup, #{works} works, #{pubs} publications and #{persons} persons" =>
    lambda do
      @context[:services].cleanup
    end
  )
end

Given(/^et verk med en utgivelse$/) do
  step "at det finnes 1 verk med 1 utgivelser og 0 personer"
end

Given(/^et verk med en utgivelse og et eksemplar$/) do
  steps %Q{
    Gitt et verk med en utgivelse
    Når jeg oppretter et eksemplar av utgivelsen
  }
end

When(/^jeg oppretter et eksemplar av utgivelsen$/) do
  # TODO: remove :publication_recordid
  recId = @context[:publication_recordid] ?
    @context[:publication_recordid] :
    @context[:services].get_value(@context[:services].publications[0], 'recordId')

  @context[:barcode] = @site.BiblioDetail.visit(recId)
    .add_item_with_random_barcode_and_itemtype(@context[:defaults][:item_type][:desc])

  @cleanup.push("delete items of biblio ##{recId}" =>
    lambda do
      @site.BiblioDetail.visit(recId).delete_all_items
    end
  )
end

When(/^jeg endrer tittelen på verket$/) do
  w = @context[:services].works[0]
  w.literals = @context[:services].set_value(w, 'mainTitle', Faker::Book.title)
  @context[:work_updated_title] =  @context[:services].get_value(w, 'mainTitle')
end

When(/^jeg besøker bokposten$/) do
  recId = @context[:publication_recordid] ?
    @context[:publication_recordid] :
    @context[:services].get_value(@context[:services].publications[0], 'recordId')
  @site.BiblioDetail.visit(recId)
end

When(/^ser jeg tittelen i bokposten$/) do
  tries = 5
  title = @context[:publication_maintitle] ?
    @context[:publication_maintitle] :
    @context[:services].get_value(@context[:services].publications[0], 'mainTitle')
  begin
    @browser.div(:id => 'catalogue_detail_biblio').h1.wait_until_present(timeout: BROWSER_WAIT_TIMEOUT).text.should include(title)
  rescue Watir::Wait::TimeoutError
    STDERR.puts "TIMEOUT: retrying ... #{(tries -= 1)}"
    if (tries == 0)
      fail
    else
      step "katalogen reindekseres"
      step "jeg besøker bokposten"
      retry
    end
  end
end

When(/^når jeg endrer tittelen på utgivelsen$/) do
  p = @context[:services].publications[0]
  p.literals = @context[:services].set_value(p, 'mainTitle', Faker::Book.title)
  @context[:publication_updated_title] =  @context[:services].get_value(p, 'mainTitle')
end

When(/^jeg endrer forfatteren på verket$/) do
  @context[:services].del_contributor(@context[:services].works[0], 'author')
  @context[:services].add_contributor(@context[:services].works[0], 'author', true)
end

When(/^jeg endrer navnet på personen$/) do
  h = @context[:services].persons[0]
  h.literals = @context[:services].set_value(h, 'name', Faker::Book.author)
  @context[:person_name_updated] = @context[:services].get_value(h, 'name')
end

When(/^ser jeg forfatteren i bokposten$/) do
  tries = 5
  # TODO remove @context[:work_creator]
  author = @context[:person_name_updated] ?
    @context[:person_name_updated] :
    @context[:services].get_value(@context[:services].works[0], 'name')
  begin
    @browser.div(:id => 'catalogue_detail_biblio').h5.wait_until_present(timeout: BROWSER_WAIT_TIMEOUT).a.text.should be == author
  rescue Watir::Wait::TimeoutError
    STDERR.puts "TIMEOUT: retrying ... #{(tries -= 1)}"
    if (tries == 0)
      fail
    else
      step "katalogen reindekseres"
      step "jeg besøker bokposten"
      retry
    end
  end
end