# encoding: UTF-8

require_relative '../page_root.rb'

class PatronClientPersonPage < PageRoot
    def visit(personId)
      @browser.goto patron_client(:person) + "/" + personId
      self
    end

    def getTitle
      return @browser.title
    end

    def getAuthor
      return @browser.span(:data_automation_id => /person_birth/).text
    end

    def getDate
      return @browser.span(:data_automation_id => /person_death/).text
    end
end