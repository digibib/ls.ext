require_relative 'circulation.rb'

class HoldsQueue < Circulation

  def visit
    @browser.goto intranet(:holdsqueue)
    self
  end

  def limit_by_branch(branch_code=nil)
    if branch_code
      @browser.select_list(:id => "branchlimit").select(branch_code)
    end
    @browser.form(:name => "f").submit
    self
  end

  def get_holds(branch_code=nil)
    limit_by_branch(branch_code)
    
    if @browser.div(:class => "dialog message").exists?
      return @browser.div(:class => "dialog message").text
    else
      @browser.table(:id => "holdst").wait_until_present
      @browser.table(:id => "holdst").tbody
    end
  end

end
