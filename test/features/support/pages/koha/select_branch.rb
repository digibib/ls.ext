# encoding: utf-8

require_relative 'intra_page.rb'

class SelectBranch < IntraPage

  def visit
    @browser.goto intranet(:select_branch)
    self
  end

  def select_branch(branch_code=nil)
    form = @browser.form(:action => "selectbranchprinter.pl")
    if branch_code
      form.select_list(:name => "branch").select_value(branch_code)
    end
    form.submit
    @site.Circulation
  end
end
