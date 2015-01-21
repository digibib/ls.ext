# encoding: UTF-8

module Users

  def user_exists?(searchString)
    session_cookie = "CGISESSID=#{@browser.cookies["CGISESSID"][:value]}"
    headers = {
     "Cookie" => session_cookie,
     "Accept" => "application/json",
     "Content-Type" => "application/x-www-form-urlencoded; charset=UTF-8"
    }
    # The search API is not well documented yet, but these params seems neccessary
    params = {
      "sEcho" => 2,
      "searchmember" => "Automat",
      "searchfieldstype" => "standard",
      "searchtype" => "contain",
      "template_path" => "members/tables/members_results.tt"
    }
    
    uri = URI.parse intranet(:search_patrons)
    http = Net::HTTP.new(uri.host, uri.port) 
    req = Net::HTTP::Post.new(uri.request_uri, headers)
    req.set_form_data(params)
    res = http.request(req)
    json = JSON.parse(res.body)
    return false if json["iTotalDisplayRecords"] == 0
    if json["aaData"].any? {|user| user["dt_name"].include? searchString }
      return true
    else
      return false
    end
  end

  # Method to import user hash via CSV in admin
  # @branch and @patroncategory need to exist be created in different steps
  def import_user_via_csv(user)
    
    # This logic should be operated elsewhere
    @branch = Branch.new unless @branch
    @patron = Patron.new unless @parent
    @patroncategory = PatronCategory.new unless @patroncategory

    user[:branchcode]   = user[:branchcode]   ? user[:branchcode]   : @branch.code
    user[:categorycode] = user[:categorycode] ? user[:categorycode] : @patroncategory.code
    user[:cardnumber]   = user[:cardnumber]   ? user[:cardnumber]   : @patron.cardnumber
    user[:surname]      = user[:surname]      ? user[:surname]      : @patron.surname
    user[:password]     = user[:password]     ? user[:password]     : @patron.password

    @patron.cardnumber = user[:cardnumber] if user[:cardnumber]
    @patron.surname    = user[:surname]    if user[:surname]
    @patron.password   = user[:password]
    @patron.branch     = @branch
    @patron.category   = @patroncategory

    # To convert to CSV via Migration 
    importuser = { user[:cardnumber] => user }

    uri = URI.parse intranet(:patron_import)

    # Generate multipart form
    form_boundary = generateRandomString
    data = []
    data << "--#{form_boundary}\r\n"
    data << "Content-Disposition: form-data; name=\"uploadborrowers\"; filename=\"patrons.csv\"\r\n"
    data << "Content-Type: text/csv\r\n"
    data << "\r\n"
    data << Migration.to_csv(importuser)
    data << "--#{form_boundary}\r\n"
    data << "Content-Disposition: form-data; name=\"matchpoint\"\r\n"
    data << "\r\n"
    data << "cardnumber\r\n"
    data << "--#{form_boundary}\r\n"
    data << "Content-Disposition: form-data; name=\"overwrite_cardnumber\"\r\n"
    data << "\r\n"
    data << "1\r\n"
    data << "--#{form_boundary}--\r\n"

    session_cookie = "CGISESSID=#{@browser.cookies["CGISESSID"][:value]}"
    headers = {
     "Cookie" => session_cookie,
     "Content-Type" => "multipart/form-data, boundary=#{form_boundary}"
    }
    http = Net::HTTP.new(uri.host, uri.port)
    req = Net::HTTP::Post.new(uri.request_uri, headers)
    req.body = data.join
    res = http.request(req)

    # Merge user into context object
    # TODO: handle multiple users by array of hashes?

    @context[:patron] = @patron
    @cleanup.push( "lånernummer #{@patron.cardnumber}" =>
      lambda do
        @browser.goto intranet(:patrons)
        @browser.text_field(:id => "searchmember").set @patron.cardnumber
        @browser.form(:action => "/cgi-bin/koha/members/member.pl").submit
        @browser.div(:class => 'patroninfo').wait_until_present
        #Phantomjs doesn't handle javascript popus, so we must override
        #the confirm function to simulate "OK" click:
        @browser.execute_script("window.confirm = function(msg){return true;}")
        @browser.button(:text => "More").click
        @browser.a(:id => "deletepatron").click
      end
    )
  end

end