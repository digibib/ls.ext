# encoding: utf-8

require_relative 'intra_page.rb'

class PatronDetails < IntraPage
  def header
    @browser.div(:class => 'patroninfo').h5.text
  end

  def card_number
    header.match(/\((.*?)\)/)[1]
  end
end