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
end