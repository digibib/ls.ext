module Paths

  def host(host=nil)
    hosts = {
        :overview => "192.168.50.21"
    }
    if host && hosts[host]
      hosts[host]
    else
      "192.168.50.12"
    end
  end

  def port(port=nil)
    ports = {
      :overview => 80,
      :koha_intra => 8081,
      :catalinker => 8010,
      :patron_client => 8000,
      :services => 8005,
      :triplestore => 3030
    }
    raise ArgumentError, "Invalid port argument" unless port && ports[port.to_sym]
    return "#{ports[port.to_sym]}"
  end

  # TODO Remove duplication

  def overview(path=nil)
    paths = {
        :home => "/"
    }
    raise ArgumentError, "Invalid or missing path argument" unless path && paths[path.to_sym]
    return "http://#{host(:overview)}:#{port(:overview)}#{paths[path.to_sym]}"
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

      :biblio_detail => "/cgi-bin/koha/catalogue/detail.pl?biblionumber=",
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
    return "http://#{host}:#{port(:koha_intra)}#{paths[path.to_sym]}"
  end

  def catalinker(path=nil)
    paths = {
      :home => "/index.html",
      :work => "/work"
    }
    raise ArgumentError, "Invalid or missing path argument" unless path && paths[path.to_sym]
    return "http://#{host}:#{port(:catalinker)}#{paths[path.to_sym]}"
  end

  def patron_client(path=nil)
    paths = {
      :work => "/work"
    }
    raise ArgumentError, "Invalid or missing path argument" unless path && paths[path.to_sym]
    return "http://#{host}:#{port(:patron_client)}#{paths[path.to_sym]}"
  end

  def services(path=nil)
    paths = {
      :work => "/work"
    }
    raise ArgumentError, "Invalid or missing path argument" unless path && paths[path.to_sym]
    return "http://#{host}:#{port(:services)}#{paths[path.to_sym]}"
  end

  def triplestore(path=nil)
    paths = {
      :work => "/sparql"
    }
    raise ArgumentError, "Invalid or missing path argument" unless path && paths[path.to_sym]
    return "http://#{host}:#{port(:triplestore)}#{paths[path.to_sym]}"
  end

end
