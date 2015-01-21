#!/usr/bin/env ruby
# encoding: utf-8
# This set of simple structs represents the @context objects

Book = Struct.new(:title, :biblionumber, :items) do
  def initialize
    self.title   = generateRandomString
    self.items   = []
  end

  def addItem
    self.items << Item.new
  end
end

Item = Struct.new(:barcode, :branch, :itemtype) do
  def initialize
    self.barcode  = '0301%010d' % rand(10 ** 10)
    self.branch   = Branch.new
    self.itemtype = ItemType.new
  end
end

Branch = Struct.new(:code, :name) do
  def initialize
    self.code   = generateRandomString
    self.name   = generateRandomString
  end
end

ItemType = Struct.new(:code, :desc) do
  def initialize
    self.code   = generateRandomString.upcase
    self.desc   = generateRandomString
  end
end

Patron = Struct.new(:cardnumber, :surname, :branch, :category) do
  def initialize
    self.cardnumber = generateRandomString
    self.surname    = generateRandomString
    self.branch     = Branch.new
    self.category   = PatronCategory.new
  end
end

PatronCategory = Struct.new(:code, :name) do
  def initialize
    self.code   = generateRandomString
    self.name   = generateRandomString
  end
end