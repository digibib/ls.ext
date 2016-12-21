# encoding: UTF-8

require_relative '../page_root.rb'

class PatronClientWorkPage < PageRoot
  def visit(workId)
    @browser.goto patron_client(:work) + "/" + workId
    Watir::Wait.until(timeout: BROWSER_WAIT_TIMEOUT) { @browser.element(data_automation_id: /work_title/).exists? }
    self
  end

  def title
    @browser.element(data_automation_id: /work_title/).wait_until_present(timeout: BROWSER_WAIT_TIMEOUT).text
  end

  def getAuthor
    return @browser.a(data_automation_id: /work_contributor_link/).wait_until_present(timeout: BROWSER_WAIT_TIMEOUT).text
  end

  def getAuthorLink
    return @browser.a(:'data_automation_id' => /work_contributor_link/).wait_until_present(timeout: BROWSER_WAIT_TIMEOUT)
  end

  def getDate
    return @browser.element(data_automation_id: /work_originalReleaseDate/).wait_until_present(timeout: BROWSER_WAIT_TIMEOUT).text
  end

  def exists_exemplar?
    wait_retry { @browser.element(data_automation_id: 'work_items').elements(xpath: './*').size > 0 }
  end

  def publication_entries(media_type = nil)
    wait_for {
      @browser.elements(data_automation_id: /^publication_http/).size > 0
    }
    if media_type
      @browser.element(data_mediatype: media_type).elements(data_automation_id: /^publication_http/)
    else
      @browser.elements(data_automation_id: 'work_publications').map { |element| element.elements(data_automation_id: /^publication_http/).to_a }.flatten
    end
  end

  def get_items(publication_identifier)
    @browser.element(data_automation_id: "publication_#{publication_identifier}").wait_until_present(timeout: BROWSER_WAIT_TIMEOUT).click
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