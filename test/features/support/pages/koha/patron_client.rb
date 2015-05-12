# encoding: UTF-8

require_relative '../page_root.rb'

class PatronClient < PageRoot
    def visit(workId)
      @browser.goto patron_client(:work) + "/" + workId
      STDOUT.puts patron_client(:work) + "/" + workId
      self
    end

    def getTitle
      return @browser.span(:data_automation_id => /work_title/).text
    end

    def getAuthor
      return @browser.span(:data_automation_id => /work_author/).text
    end

    def getDate
      return @browser.span(:data_automation_id => /work_date/).text
    end

end