# encoding: utf-8

require 'rspec'

require_relative '../paths.rb'

class PageRoot
  include Paths
  include RSpec::Matchers

  def initialize(site)
    @site = site
    @browser = site.browser
  end
end