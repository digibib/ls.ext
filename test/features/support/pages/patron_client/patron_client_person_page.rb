# encoding: UTF-8

require_relative '../page_root.rb'

class PatronClientPersonPage < PageRoot
    def visit(personId)
      @browser.goto patron_client(:person) + "/" + personId
      self
    end

    def getTitle
      @browser.title
    end

    def getPersonName
      return @browser.span(:data_automation_id => "person-name").when_present(BROWSER_WAIT_TIMEOUT).text
    end

    def getPersonTitle
      return @browser.span(:data_automation_id => "person-title").when_present(BROWSER_WAIT_TIMEOUT).text
    end

    def getBirth
      return @browser.span(:data_automation_id => "person-birth").when_present(BROWSER_WAIT_TIMEOUT).text
    end

    def getDeath
      return @browser.span(:data_automation_id => "person-death").when_present(BROWSER_WAIT_TIMEOUT).text
    end

    def getNationality
      return @browser.span(:data_automation_id => "person-nationality").when_present(BROWSER_WAIT_TIMEOUT).text
    end

    def getWorkslist
      works = Array.new
      @browser.divs(:class => "work").each do |work|
        works.push(work.p.a.strong.text)
      end
      works
    end
end