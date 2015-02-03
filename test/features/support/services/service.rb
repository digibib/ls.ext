# encoding: utf-8

require 'rspec'
require_relative '../paths.rb'

class Service
  include Paths
  include RSpec::Matchers

  def initialize(browser,context=nil,active=nil)
    @browser = browser
    @context = context
    @active  = active
  end
end
