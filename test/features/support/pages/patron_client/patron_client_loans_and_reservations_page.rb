# encoding: UTF-8

require_relative '../page_root.rb'

class PatronClientLoansAndReservationsPage < PageRoot
  def visit
    @browser.goto patron_client(:loansAndReservations)
    wait_retry {
      @browser.element(data_automation_id: 'profile_page').exists? || @browser.element(data_automation_id: 'profile_not_logged_in').exists?
    }
    self
  end

  def reservations
    @browser.elements(data_automation_id: 'UserLoans_reservation')
  end

  def pickups
    @browser.elements(data_automation_id: 'UserLoans_pickup')
  end

  def loans
    @browser.elements(data_automation_id: 'UserLoans_loan')
  end

  def queue_places
    @browser.elements(data_automation_id: 'UserLoans_reservation_queue_place')
  end

  def suspend_messages
    @browser.elements(data_automation_id: 'Userloans_reservation_suspend_message')
  end
end