# encoding: UTF-8

require_relative '../page_root.rb'

class PatronClientProfilePage < PageRoot
  def visit
    @browser.goto patron_client(:profile)
    wait_retry {
      @browser.element(data_automation_id: 'profile_page').exists? || @browser.element(data_automation_id: 'profile_not_logged_in').exists?
    }
    self
  end

  def borrowernumber
    wait_retry { @browser.element(data_automation_id: 'UserInfo_borrowerNumber').exists? }
    @browser.element(data_automation_id: 'UserInfo_borrowerNumber').text
  end
end