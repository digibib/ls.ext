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

    def getAuthor
      @browser.span(:data_automation_id => /person_birth/).text
    end

    def getDate
      @browser.span(:data_automation_id => /person_death/).text
    end

    def getWorkslist
      works = Array.new
      @browser.divs(:class => "work").each do |work|
        works.push(work.p.a.strong.text)
      end
      works
    end
end