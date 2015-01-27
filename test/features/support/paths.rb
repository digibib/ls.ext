module Paths

  def host
    "192.168.50.12"
  end

  def port
    8081
  end

  def intranet(path=nil)
    paths = {
      :home     => "/",
      :login    => "/cgi-bin/koha/mainpage.pl?logout.x=1",
      :branches => "/cgi-bin/koha/admin/branches.pl",
      :patron_categories => "/cgi-bin/koha/admin/categorie.pl",
      :patrons => "/cgi-bin/koha/members/members-home.pl",
      :patron => "/cgi-bin/koha/members/moremember.pl?borrowernumber=",
      :patron_import => "/cgi-bin/koha/tools/import_borrowers.pl",
      :search_patrons => "/cgi-bin/koha/svc/members/search",
      :preferences => "/cgi-bin/koha/svc/config/systempreferences/",
      :admin    => "/cgi-bin/koha/admin/admin-home.pl",
      :item_types => "/cgi-bin/koha/admin/itemtypes.pl",
      :bib_record => "/cgi-bin/koha/catalogue/detail.pl?biblionumber=",
      :add_item => "/cgi-bin/koha/cataloguing/additem.pl?biblionumber=",
      :reserve => "/cgi-bin/koha/reserve/request.pl?biblionumber=",
      :pendingreserves => "/cgi-bin/koha/circ/pendingreserves.pl",
      :holdsqueue => "/cgi-bin/koha/circ/view_holdsqueue.pl",
      :waitingreserves => "/cgi-bin/koha/circ/waitingreserves.pl?allbranches=1",
      :stage_marc => "/cgi-bin/koha/tools/stage-marc-import.pl",
      :select_branch => "/cgi-bin/koha/circ/selectbranchprinter.pl",
      :checkout => "/cgi-bin/koha/circ/circulation.pl",
      :authorised_values => "/cgi-bin/koha/admin/authorised_values.pl",
      :cataloguing => "/cgi-bin/koha/cataloguing/addbooks.pl",
      :circulation_rules => "/cgi-bin/koha/admin/smart-rules.pl"
      }
    raise ArgumentError, "Invalid or missing path argument" unless path && paths[path.to_sym]
    return "http://#{host}:#{port}#{paths[path.to_sym]}"
  end
end