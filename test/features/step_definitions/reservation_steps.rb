# encoding: UTF-8
require_relative '../support/services/test_setup/TestSetup.rb'
require 'pp'

Given(/^at Koha er populert med ([0-9]) lånere, ([0-9]) eksemplarer og ([0-9]) reserveringer$/) do |patrons,items,holds|

  @context[:koha].populate({patrons: patrons.to_i, items: items.to_i, holds: {numberOfHolds: holds.to_i}})
  # TODO: Remove the old @context[:koha_rest_api_cookie] when no longer needed
  @context[:koha_rest_api_cookie] = @context[:koha].headers["Cookie"]
  @context[:c] = []
  @cleanup.push( "cleaning up TestSetup, #{patrons} patrons, #{items} items and #{holds} holds" =>
    lambda do
      @context[:koha].cleanup
    end
  )
end

When(/^eksemplar "([^"]*)" blir innlevert på "([^"]*)"$/) do |item, branch|
  c = TestSetup::Circulation.new "sip_proxy", "9999"
  @context[:c] << c.checkin("hutl", @context[:koha].biblio["items"][item.to_i-1]["barcode"])
end

Then(/^gir systemet tilbakemelding om at at reservasjon "([^"]*)" er klar til avhenting på "([^"]*)"$/) do |hold,pickupbranch|
  id = @context[:koha].holds[hold.to_i-1]["reserve_id"]
  res = @context[:koha].get_hold(id.to_i)
  expect(res[0]["branchcode"]).to eq(pickupbranch)
  @context[:c] << res[0]
end

Then(/^låner får hentemelding med hentenummer på eksemplar "([^"]*)"$/) do |item|
  last_msg = @context[:c].last
  expect(last_msg["pickupnumber"]).not_to be_empty
  expect(last_msg["itemnumber"]).to eq(@context[:koha].biblio["items"][item.to_i-1]["itemnumber"].to_i)
end
