# encoding: utf-8

require_relative 'intra_page.rb'

class SelectBranch < IntraPage

  def visit
    @browser.goto intranet(:select_branch)
    self
  end

  def select_branch(branch_name=nil)
    raise "Todo: fix branch_name_argument" if branch_name
    @browser.form(:action => "selectbranchprinter.pl").submit
    @site.Circulation
  end
end