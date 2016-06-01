# encoding: utf-8

require_relative '../page_root.rb'

class IntraPage < PageRoot

  def search_catalog(query)
    @browser.a(:href => "#catalog_search").click
    form = @browser.form(:id => "cat-search-block")
    form.text_field(:id => "search-form").set query
    form.submit

    # Sometimes we're a bit quick and reindexing hasn't completed so we'll retry ONCE
    if @browser.div(:id => 'searchheader').h3.exists?
      if @browser.div(:id => 'searchheader').h3.text == ("No results found")
        sleep(2)
        @browser.refresh
      end
    end

    @site.BiblioDetail
  end

  def select_branch(branch_code=nil)
    @site.SelectBranch.visit.select_branch(branch_code)
  end

  def checkin(barcode)
    @browser.a(:href => "#checkin_search").click
    @browser.text_field(:id => "ret_barcode").set barcode
    @browser.form(:action => "/cgi-bin/koha/circ/returns.pl").submit
    # todo -- where do we end up?
  end

  def confirm_checkin
    @browser.button(class: 'approve').click
  end

  def search_patrons(patron_query)
    @browser.a(:href => "#patron_search").click
    @browser.text_field(:id => "searchmember").set patron_query
    @browser.form(:action => "/cgi-bin/koha/members/member.pl").submit
    @browser.div(:class => 'patroninfo').wait_until_present
    @site.PatronDetails
  end

  def find_patron_for_checkout(patron_query)
    @browser.text_field(:id => "findborrower").set patron_query
    @browser.form(:id => "patronsearch").submit
    @site.Checkout
  end

  def logged_in (userid)
    @browser.span(:class => 'loggedinusername').exists? &&
        @browser.span(:class => 'loggedinusername').text.strip == userid
  end
end
