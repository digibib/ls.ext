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

  def turn_off_ui_blocker
    if @browser.span(:id => 'ui-blocker-blocker').present?
      @browser.span(:id => 'ui-blocker-blocker').click
    end
  end
end