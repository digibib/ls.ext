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
      return @browser.span(:data_automation_id => "person-name").wait_until_present(timeout: BROWSER_WAIT_TIMEOUT).text
    end

    def getPersonTitle
      return @browser.span(:data_automation_id => "person-title").wait_until_present(timeout: BROWSER_WAIT_TIMEOUT).text
    end

    def getBirth
      lifespan = @browser.span(:data_automation_id => "person-lifespan").wait_until_present(timeout: BROWSER_WAIT_TIMEOUT).text
      return lifespan[1..lifespan.index("-")-1]
    end

    def getDeath
      lifespan = @browser.span(:data_automation_id => "person-lifespan").wait_until_present(timeout: BROWSER_WAIT_TIMEOUT).text
      return lifespan[lifespan.index("-")+1..-2]
    end

    def getNationality
      return @browser.span(:data_automation_id => "person-nationality").wait_until_present(timeout: BROWSER_WAIT_TIMEOUT).text
    end

    def getWorkslist
      works = Array.new
      @browser.ps(:class => "work").each do |work|
        works.push(work.a.strong.text)
      end
      works
    end
end