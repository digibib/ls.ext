# encoding: UTF-8

require_relative '../page_root.rb'

class PatronClientCommon < PageRoot
  def visit
    @browser.goto patron_client()
    self
  end

  def current_language? language
    @browser.element(data_current_language: language).exists?
  end

  def click_change_language
    @browser.element(data_automation_id: 'change_language_element').click
  end

  def login(username = nil, password = nil, skip_validate_logged_in = false)
    if (username && password)
      unless @browser.element(data_automation_id: 'login_modal').exists?
        if @browser.element(data_automation_id: 'logout_element').exists?
          @browser.element(data_automation_id: 'logout_element').click
        end
        @browser.element(data_automation_id: 'login_element').click
      end
      wait_for { @browser.element(data_automation_id: 'login_modal').exists? }
      @browser.element(data_automation_id: 'login_modal').text_fields.first.set(username)
      @browser.element(data_automation_id: 'login_modal').text_fields.last.set(password)
      @browser.element(data_automation_id: 'login_button').click
      unless skip_validate_logged_in
        wait_retry { @browser.element(data_automation_id: 'logout_element').exists? }
      end
    else
      if (@browser.element(data_automation_id: 'login_element').present? && !@browser.element(data_automation_id: 'login_modal').present?)
        @browser.element(data_automation_id: 'login_element').click
      end
    end
  end

  def logout
    if (@browser.element(data_automation_id: 'logout_element').present?)
      @browser.element(data_automation_id: 'logout_element').click
    end
  end

  def login_modal_visible?
    @browser.element(data_automation_id: 'login_modal').exists?
  end

  def reservation_modal_visible?
    @browser.element(data_automation_id: 'reservation_modal').exists?
  end

  def reservation_success_modal_visible?
    @browser.element(data_automation_id: 'reservation_success_modal').exists?
  end

  def reservation_error_modal_visible?
    @browser.element(data_automation_id: 'reservation_error_modal').exists?
  end

  def registration_modal_visible?
    @browser.element(data_automation_id: 'registration_modal').exists?
  end

  def registration_success_modal_visible?
    @browser.element(data_automation_id: 'registration_success_modal').exists?
  end

  def selected_library
    @browser.select_list(data_automation_id: 'libraries').value
  end
end