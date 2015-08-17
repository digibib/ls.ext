require_relative 'circulation.rb'

class WaitingReserves < Circulation

  def visit
    # for now, path checks waiting reserves for all branches
    @browser.goto intranet(:waitingreserves)
    self
  end

  def get_waiting_reserves
    return @browser.div(:id => "holdswaiting").table(:id => "holdst").tbody
  end

end
