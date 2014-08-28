module FeatureStack
  # Handle deletion of resources created in steps
  # Creates in-place lambda procs that can be stacked and run later with lambda.call

  def libraryCreated(branchcode)
    l = lambda do 
      @browser.goto intranet(:branches)
      @browser.table(:id => "branchest").rows.each do | row |
        if row.text.include?(branchcode)
          row.link(:href => /op=delete/).click
          break # the click will cause navigation so iterating more might fail
        end
      end
      form = @browser.form(:action => "/cgi-bin/koha/admin/branches.pl")
      if form.text.include?(branchcode)
        form.submit
      end
    end
  end

  def itemTypeCreated(itemtype)
    l = lambda do
      @browser.goto intranet(:item_types)
      table = @browser.table(:id => "table_item_type")
      table.rows.each do |row|
        if row.text.include?(itemtype)
          row.link(:href => /op=delete_confirm/).click
          @browser.input(:value => "Delete this Item Type").click
          break
        end
      end
    end
  end

  def patronCategoryCreated(patroncategory)
    l = lambda do
      @browser.goto intranet(:patron_categories)
      table = @browser.table(:id => "table_categorie")
      table.rows.each do |row|
        if row.text.include?(patroncategory)
          row.link(:href => /op=delete_confirm/).click
          @browser.input(:value => "Delete this category").click
          break
        end
      end
    end
  end

  def userCreated(user)
    # should perhaps use card number for unique ids?
    l = lambda do
      @browser.goto intranet(:patrons)
      @browser.text_field(:id => "searchmember").set user
      @browser.form(:action => "/cgi-bin/koha/members/member.pl").submit
      #Phantomjs doesn't handle javascript popus, so we must override
      #the confirm function to simulate "OK" click:
      @browser.execute_script("window.confirm = function(msg){return true;}")
      @browser.button(:text => "More").click
      @browser.a(:id => "deletepatron").click
      #@browser.alert.ok #works in chrome & firefox, but not phantomjs
    end
  end

  def bookCreated(book_id)
    l = lambda do
      @browser.goto intranet(:bib_record)+book_id

      #delete book items
      @browser.execute_script("window.confirm = function(msg){return true;}")
      @browser.button(:text => "Edit").click
      @browser.a(:id => "deleteallitems").click

      #delete book record
      @browser.execute_script("window.confirm = function(msg){return true;}")
      @browser.button(:text => "Edit").click
      @browser.a(:id => "deletebiblio").click
    end
  end

  def bookCheckedOut(barcode)
    l = lambda do
      @browser.goto intranet(:select_branch)
      @browser.form(:action => "selectbranchprinter.pl").submit
      @browser.a(:href => "#checkin_search").click
      @browser.text_field(:id => "ret_barcode").set barcode
      @browser.form(:action => "/cgi-bin/koha/circ/returns.pl").submit
    end
  end

end