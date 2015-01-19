# encoding: utf-8

require 'rspec'

require_relative '../paths.rb'

class Page
  include Paths
  include RSpec::Matchers

  def initialize(browser)
    @browser = browser
  end
end