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

      :patrons => "/cgi-bin/koha/members/members-home.pl",
      :patron_details => "/cgi-bin/koha/members/moremember.pl?borrowernumber=",

      :select_branch => "/cgi-bin/koha/circ/selectbranchprinter.pl",
      :checkout => "/cgi-bin/koha/circ/circulation.pl",
      :holdsqueue => "/cgi-bin/koha/circ/view_holdsqueue.pl",
      :reserve => "/cgi-bin/koha/reserve/request.pl?biblionumber=",
      :pendingreserves => "/cgi-bin/koha/circ/pendingreserves.pl",
      :waitingreserves => "/cgi-bin/koha/circ/waitingreserves.pl?allbranches=1",

      :bib_record => "/cgi-bin/koha/catalogue/detail.pl?biblionumber=",
      :cataloguing => "/cgi-bin/koha/cataloguing/addbooks.pl",
      :add_item => "/cgi-bin/koha/cataloguing/additem.pl?biblionumber=",
      :mod_biblio => "/cgi-bin/koha/cataloguing/addbiblio.pl?biblionumber=",

      # admin
      :admin    => "/cgi-bin/koha/admin/admin-home.pl",
      :authorised_values => "/cgi-bin/koha/admin/authorised_values.pl",
      :branches => "/cgi-bin/koha/admin/branches.pl",
      :item_types => "/cgi-bin/koha/admin/itemtypes.pl",
      :patron_categories => "/cgi-bin/koha/admin/categorie.pl",
      :search_preferences => "/cgi-bin/koha/admin/preferences.pl?op=search&searchfield=",
      :koha2marc_mapping => "/cgi-bin/koha/admin/koha2marclinks.pl?op=add_form&tablename=",
      :circulation_rules => "/cgi-bin/koha/admin/smart-rules.pl",

      # tools
      :patron_import => "/cgi-bin/koha/tools/import_borrowers.pl",
      :stage_marc => "/cgi-bin/koha/tools/stage-marc-import.pl",

      # svc
      :search_patrons => "/cgi-bin/koha/svc/members/search",
      :preferences => "/cgi-bin/koha/svc/config/systempreferences/"
      }
    raise ArgumentError, "Invalid or missing path argument" unless path && paths[path.to_sym]
    return "http://#{host}:#{port}#{paths[path.to_sym]}"
  end
end