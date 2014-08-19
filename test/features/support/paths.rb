class Paths
  def intranet(path=nil)
    prefix = "http://192.168.50.10:8081"
    case path
    when 'branches'
      return prefix + "/cgi-bin/koha/admin/branches.pl"
    when 'admin'
      return prefix + "/cgi-bin/koha/admin/admin-home.pl"
    else
      return prefix
    end
  end
end