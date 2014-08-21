class Paths

  def host
    "192.168.50.10"
  end

  def port
    8081
  end

  def intranet(path=nil)
    paths = {
      :home     => "/",
      :branches => "/cgi-bin/koha/admin/branches.pl",
      :patron_categories => "/cgi-bin/koha/admin/categorie.pl",
      :patrons => "/cgi-bin/koha/members/members-home.pl",
      :admin    => "/cgi-bin/koha/admin/admin-home.pl"
      }
    raise ArgumentError, "Invalid or missing path argument" unless path && paths[path.to_sym]
    return "http://#{host}:#{port}#{paths[path.to_sym]}"
  end
end