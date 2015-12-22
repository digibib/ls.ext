# encoding: UTF-8

require_relative 'catalinker_page.rb'

class WorkFlow < CatalinkerPage
  def visit
    @browser.goto catalinker(:workflow)
    Watir::Wait.until(BROWSER_WAIT_TIMEOUT) {
        @browser.divs(:class => "prop-input").size > 1 # wait until dom-tree has been populated
    }
    self
  end

  def nextStep
    @browser.div(:class => "grid-panel-selected").button(:class =>  "next-step-button").click
  end

  def assertSelectedTab(nameOfVisibleTag)
    @browser.ul(:id => "workflow-tabs").a(:class => "grid-tab-link-selected").text.should eq nameOfVisibleTag
  end

  def add_prop(domain, predicate, value, nr=0, skip_wait=false)
    super domain + "_" + predicate, value, nr, skip_wait
  end

  def select_prop(domain, predicate, value, nr=0)
    super domain + "_" + predicate, value, nr
  end

  def get_link_to_work
    @browser.a(:data_automation_id => "work_page_link")
  end
end
