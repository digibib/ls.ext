require_relative 'circulation.rb'

class PendingReserves < Circulation

  def visit
    @browser.goto intranet(:pendingreserves)
    self
  end

  def get_pending_reserves
    @browser.table(:id => "holdst")
  end

end

