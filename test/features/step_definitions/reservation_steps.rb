# encoding: UTF-8
require_relative '../support/services/test_setup/TestSetup.rb'
require 'pp'

Given(/^at Koha er populert med "(.*)" lånere, "(.*)" eksemplarer og "(.*)" reserveringer$/) do |patrons,items,holds|
  # table is a Cucumber::MultilineArgument::DataTable
  t = TestSetup::Koha.new "xkoha"

  t.populate patrons: patrons, items: items, holds: holds
  @context[:t] = t
  @context[:c] = []
  @cleanup.push( "cleaning up TestSetup, #{patrons} patrons, #{items} items and #{holds} holds" =>
    lambda do
      t.cleanup
    end
  )
end

When(/^eksemplar "([^"]*)" blir innlevert på "([^"]*)"$/) do |item, branch|
  c = TestSetup::Circulation.new "sip_proxy", "9999"
  @context[:c] << c.checkin("hutl", @context[:t].biblio["items"][item.to_i-1]["barcode"])
end

Then(/^gir systemet tilbakemelding om at at reservasjon "([^"]*)" er klar til avhenting på "([^"]*)"$/) do |hold,pickupbranch|
  id = @context[:t].holds[hold.to_i-1]["reserve_id"]
  res = @context[:t].get_hold(id.to_i)
  expect(res[0]["branchcode"]).to eq(pickupbranch)
  @context[:c] << res[0]
end

Then(/^låner får hentemelding med hentenummer på eksemplar "([^"]*)"$/) do |item|
  last_msg = @context[:c].last
  expect(last_msg["pickupnumber"]).not_to be_empty
  expect(last_msg["itemnumber"]).to eq(@context[:t].biblio["items"][item.to_i-1]["itemnumber"])
end
