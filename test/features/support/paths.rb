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
      :admin    => "/cgi-bin/koha/admin/admin-home.pl",
      :item_types => "/cgi-bin/koha/admin/itemtypes.pl",
      :bib_record => "/cgi-bin/koha/catalogue/detail.pl?biblionumber=",
      :stage_marc => "/cgi-bin/koha/tools/stage-marc-import.pl",
      :select_branch => "/cgi-bin/koha/circ/selectbranchprinter.pl",
      :checkout => "/cgi-bin/koha/circ/circulation.pl"
      }
    raise ArgumentError, "Invalid or missing path argument" unless path && paths[path.to_sym]
    return "http://#{host}:#{port}#{paths[path.to_sym]}"
  end
end