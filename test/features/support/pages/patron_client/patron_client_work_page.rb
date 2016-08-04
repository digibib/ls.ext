# encoding: UTF-8

require_relative '../page_root.rb'

class PatronClientWorkPage < PageRoot
  def visit(workId)
    @browser.goto patron_client(:work) + "/" + workId
    Watir::Wait.until(BROWSER_WAIT_TIMEOUT) { @browser.element(data_automation_id: /work_title/).exists? }
    self
  end

  def title
    @browser.element(data_automation_id: /work_title/).when_present(BROWSER_WAIT_TIMEOUT).text
  end

  def getAuthor
    return @browser.a(data_automation_id: /work_contributor_link/).when_present(BROWSER_WAIT_TIMEOUT).text
  end

  def getAuthorLink
    return @browser.a(:'data_automation_id' => /work_contributor_link/).when_present(BROWSER_WAIT_TIMEOUT)
  end

  def getDate
    return @browser.element(data_automation_id: /work_date/).when_present(BROWSER_WAIT_TIMEOUT).text
  end

  def exists_exemplar?
    wait_retry { @browser.element(data_automation_id: 'work_items').elements(xpath: './*').size > 0 }
  end

  def publication_entries
    @browser.element(data_automation_id: 'work_publications').when_present(BROWSER_WAIT_TIMEOUT).elements(data_automation_id: /^publication_http/)
  end

  def get_items(publication_identifier)
    @browser.element(data_automation_id: "publication_#{publication_identifier}").when_present(BROWSER_WAIT_TIMEOUT).click
    publication_info = @browser.element(data_automation_id: "publication_info_#{publication_identifier}")
    wait_retry { publication_info.present? }
    publication_info.table.rows.select { |row| row.ths.size === 0 && row.tds.size > 0 }
  end

  def click_first_reserve
    wait_retry { @browser.element(data_automation_id: 'publication_available').exists? }
    @browser.element(data_automation_id: 'publication_available').click
    button = @browser.element(data_automation_id: 'publication_order').parent
    button.click
    button.attribute_value('data-automation-id').split('_').last #recordId
  end
end