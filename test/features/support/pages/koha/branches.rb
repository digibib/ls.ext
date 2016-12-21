# encoding: utf-8

require 'watir'
require_relative 'intra_page.rb'

class Branches < IntraPage
  def visit
    @browser.goto intranet(:branches)
    branch_select = @browser.div(id: 'branchest_length')
    if (branch_select.exists? && branch_select.select_list.exists?)
      branch_select.select_list.select_value('-1') # Show all branches
    end
    self
  end

  def filter(branch_name)
    @browser.div(:id => "branchest_filter").text_field().set branch_name
    self
  end

  def delete(branch_code)
    @browser.link(:href => "/cgi-bin/koha/admin/branches.pl?op=delete_confirm&branchcode=" + branch_code).click
    form = @browser.form(:action => "/cgi-bin/koha/admin/branches.pl")
    if form.text.include?(branch_code)
      form.submit
    end
    @browser.div(:class => "dialog message").text.should =~ /deleted|slettet/
    self
  end

  def create(branch_name, branch_code)
    @browser.link(:id => "newbranch").click
    form = @browser.form(:name => "Aform")
    form.text_field(:id => "branchname").set branch_name
    form.text_field(:id => "branchcode").set branch_code
    form.submit
    @browser.form(:name => "Aform").should_not be_present
    self
  end

  def exists(branch_name, branch_code)
    # todo - rewrite as matcher?
    table = @browser.table(:id => "branchest")
    table.should be_present
    table.text.should include(branch_name)
    table.text.should include(branch_code)
    self
  end

  def show_all
    @browser.select_list(:name => "branchest_length").select_value("-1")
  end

  def all_exists(branches)
    # todo - split into better data table
    rows = @browser.table(:id => "branchest").tbody.rows
    orig = []
    rows.each do |row|
      orig << { :branchname => row[0].text, :branchcode => row[1].text }
    end

    csv = []
    CSV.foreach(branches, {
                             :headers => true,
                             :encoding => 'UTF-8',
                             :header_converters => :symbol
                         }) do |c|
      csv << { :branchname => c[:branchname], :branchcode => c[:branchcode] }
    end
    # Array comparison
    a = (orig & csv == orig)
    b = (csv & orig == csv)

    a.should == true
    b.should == true
    self
  end
end