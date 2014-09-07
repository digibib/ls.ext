#!/usr/bin/env ruby
# encoding: utf-8

require 'csv'

class Migration

  def initialize(mapping)
    @mapping = {}
    parse_to_map(mapping)
  end

  # Small utility method to convert structured csv to map, where:
  #   first column   = map id
  #   column headers = keys  
  def parse_to_map(mapping)
    begin
      CSV.foreach(mapping, {
        :headers => true, 
        :encoding => 'UTF-8', 
        :header_converters => :symbol
      }) do |row|
        @mapping[row.fields[0]] = Hash[row.headers[1..-1].zip(row.fields[1..-1])]
      end
    rescue => e
      raise "Error in mapping file: " + e
    end
  end

end
