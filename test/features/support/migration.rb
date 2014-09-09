#!/usr/bin/env ruby
# encoding: utf-8

require 'csv'

class Migration
  attr_accessor :import, :csv, :file

  def initialize(csv)
    @import = {}
    @headers = []
    csv_to_map(csv)
  end

  # Small utility method to convert structured csv to map for testing, where:
  #   first column in row = map id
  #   column headers      = keys
  #   next columns in row = values
  # e.g: @map.import["<id>"]["cardname"]
  def csv_to_map(csv)
    begin
      CSV.foreach(csv, {
        :headers => true, 
        :encoding => 'UTF-8',
        :header_converters => :symbol
      }) do |row|
        @import[row.fields[0]] = Hash[row.headers[1..-1].zip(row.fields[1..-1])]
      end
    rescue => e
      raise "Error in csv file: " + e
    end
  end

  def to_csv
    ids = @import.keys
    @csv = CSV.generate do |csv|
      ids.each_with_index do |id, idx|
        @import[id][:old_id] = id                    # append old id
        csv << @import.values.first.keys if idx == 0 # headers row
        csv << @import[id].values                    # append values map
      end
    end
  end

  def export_csv(file)
    File.open(file, "w") { |file| file.write @csv.to_s }
  end
end
