#!/usr/bin/env ruby
# encoding: utf-8

require 'csv'

class Migration
  attr_accessor :map, :import, :out

  def initialize(map, import)
    @map    = csv_to_hash(map)
    @import = csv_to_hash(import)
  end

  # Small utility method to convert structured csv to map for testing, where:
  #   first column in row = map id
  #   column headers      = keys
  #   next columns in row = values
  # e.g: @map.import["<user id>"]["cardname"]
  def csv_to_hash(csv)
    hash = {}
    begin
      CSV.foreach(csv, {
        :headers => true, 
        :encoding => 'UTF-8',
        :header_converters => :symbol
      }) do |row|
        hash[row.fields[0]] = Hash[row.headers[1..-1].zip(row.fields[1..-1])]
      end
      return hash
    rescue => e
      raise "Error in csv file: " + e
    end
  end

  def to_csv(hash)
    ids = hash.keys
    csv = CSV.generate do |c|
      ids.each_with_index do |id, idx|
        hash[id][:old_id] = id                    # append old id
        c << hash.values.first.keys if idx == 0 # headers row
        c << hash[id].values                    # append key,values map
      end
    end
    return csv
  end

  def export_csv(file)
    csv = to_csv(@import)
    File.open(file, "w") do |file| 
      file.write csv.to_s
    end
  end
end
