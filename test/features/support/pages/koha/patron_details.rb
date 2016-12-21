# encoding: utf-8

require_relative 'intra_page.rb'

class PatronDetails < IntraPage
  def header
    header = @browser.div(:class => 'patroninfo')
    header.wait_until_present
    header.h5.text
  end

  def card_number
    header.match(/\((.*?)\)/)[1]
  end

  def show_checkouts
    if @browser.link(:id => 'issues-table-load-now-button').exists?
      @browser.link(:id => 'issues-table-load-now-button').click
      @browser.table(:id => "issues-table").wait_until_present
      Watir::Wait.until(timeout: BROWSER_WAIT_TIMEOUT) {
        @browser.tr(:id => "group-id-issues-table_-strong-today-s-checkouts-strong-").exists? ||
        @browser.tr(:id => "group-id-issues-table_-strong-previous-s-checkouts-strong-").exists?
      }
    end
    self
  end

  def checkouts_text
    @browser.div(:id => "checkouts").text
  end

  def set_permission(permission)
    @browser.button(:text => /(More|Mer)/).click
    @browser.a(:id => "patronflags").click
    form = @browser.form(:action => "/cgi-bin/koha/members/member-flags.pl")
    form.checkbox(:value => "#{permission}").set
    form.submit
  end

  def check_permission(permission)
    @browser.button(:text => /(More|Mer)/).click
    @browser.a(:id => "patronflags").click
    permissions = @browser.ul(:id => "permissionstree")
    permissions.checkbox(:value => "#{permission}").set?
  end

  def delete
    #Phantomjs doesn't handle javascript popus, so we must override
    #the confirm function to simulate "OK" click:
    @browser.execute_script("window.confirm = function(msg){return true;}")
    @browser.button(:text => /(More|Mer)/).click
    @browser.a(:id => "deletepatronlocal").click
    #@browser.alert.ok #works in chrome & firefox, but not phantomjs
    self
  end

  def set_messaging_preferences(table)
    @browser.div(:id => "patron-messaging-prefs").element(:xpath => './following-sibling::*').link.click # Click "Edit"
    table = @browser.fieldset(:id => "memberentry_messaging_prefs").table
    @browser.form(:id => "entryform").wait_until_present
    @browser.checkbox(:id => "email4").set
    @browser.form(:id => "entryform").submit
  end
end