# encoding: utf-8

require_relative 'circulation.rb'

class Checkout < Circulation

  def checkout(barcode)
    @browser.execute_script("printx_window = function() { return };") #Disable print slip popup
    form = @browser.form(:id => "mainform")
    form.text_field(:id => "barcode").set(barcode)
    form.submit
  end

end