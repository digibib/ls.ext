class Paths

  def intranet(path=nil)
    prefix = "http://192.168.50.10:8081"
    paths = {
      :home     => "/",
      :branches => "/cgi-bin/koha/admin/branches.pl",
      :admin    => "/cgi-bin/koha/admin/admin-home.pl"
      }
    raise ArgumentError, "Invalid or missing path argument" unless path && paths[path.to_sym] 
    return prefix + paths[path.to_sym]
  end
end