# encoding: UTF-8

require_relative '../page_root.rb'

class PatronClientWorkPage < PageRoot
    def visit(workId)
      @browser.goto patron_client(:work) + "/" + workId
      Watir::Wait.until(BROWSER_WAIT_TIMEOUT) { @browser.h2(:data_automation_id => /work_title/).present? }
      self
    end

    def getTitle
      return @browser.h2(:data_automation_id => /work_title/).when_present(BROWSER_WAIT_TIMEOUT).text
    end

    def getAuthor
      return @browser.p(:data_automation_id => /work_author/).when_present(BROWSER_WAIT_TIMEOUT).text
    end

    def getAuthorLink
      return @browser.p(:'data_automation_id' => /work_author/).when_present(BROWSER_WAIT_TIMEOUT).a
    end

    def getDate
      return @browser.span(:data_automation_id => /work_date/).when_present(BROWSER_WAIT_TIMEOUT).text
    end

    def existsExemplar
      if @browser.td(:data_automation_id => /item_location/).when_present(BROWSER_WAIT_TIMEOUT).text
        location = true
      else
        location = false
      end
      return location
    end

    def getPublicationsTableRows
      return @browser.div(:id=> "publications").when_present(BROWSER_WAIT_TIMEOUT).table.tbody.rows
    end

    def getItemsTableRows
      return @browser.div(:id=> "items").when_present(BROWSER_WAIT_TIMEOUT).table.tbody.rows
    end
end