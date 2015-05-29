# encoding: UTF-8

require_relative '../page_root.rb'

class Overview < PageRoot
  def visit
    @browser.goto overview(:home)
    self
  end

  def title
    @browser.title
  end

  def link_exists?(selector)
    @browser.link(selector).exists?
  end
end
