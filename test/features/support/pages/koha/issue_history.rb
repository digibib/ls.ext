# encoding: utf-8

require_relative 'intra_page.rb'

class IssueHistory < IntraPage

  def visit(biblionumber)
    @browser.goto intranet(:issue_history) + biblionumber 
    self
  end

  def issues
    @browser.table(:id => 'table_issues').tbody
  end

end