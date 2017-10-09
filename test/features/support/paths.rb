module Paths

  def host(host=nil)
    hosts = {} # Can be used to test services on different hosts
    if host && hosts[host]
      hosts[host]
    else
      ENV["HOST"] || "192.168.50.12"
    end
  end

  def port(port=nil)
    ports = {
      :overview => 80,
      :koha_intra => 8081,
      :koha_opac => 8080,
      :catalinker => 8010,
      :patron_client => 8000,
      :services => 8005,
      :email_api => 8000,
      :triplestore => 3030
    }
    raise ArgumentError, "Invalid port argument" unless port && ports[port.to_sym]
    "#{ports[port.to_sym]}"
  end

  # TODO Remove duplication

  def overview(path=nil)
    paths = {
        :home => "/"
    }
    raise ArgumentError, "Invalid or missing path argument" unless path && paths[path.to_sym]
    "http://#{host(:overview)}:#{port(:overview)}#{paths[path.to_sym]}"
  end

  def opac
    "http://xkoha:#{port(:koha_opac)}"
  end

  def intranet(path=nil)
    paths = {
      :home     => "/",
      :login    => "/cgi-bin/koha/mainpage.pl?logout.x=1",

      :patrons => "/cgi-bin/koha/members/members-home.pl",
      :patron_details => "/cgi-bin/koha/members/moremember.pl?borrowernumber=",

      :select_branch => "/cgi-bin/koha/circ/selectbranchprinter.pl",
      :checkout => "/cgi-bin/koha/circ/circulation.pl",
      :returns => "/cgi-bin/koha/circ/returns.pl",
      :holdsqueue => "/cgi-bin/koha/circ/view_holdsqueue.pl",
      :reserve => "/cgi-bin/koha/reserve/request.pl?biblionumber=",
      :pendingreserves => "/cgi-bin/koha/circ/pendingreserves.pl",
      :waitingreserves => "/cgi-bin/koha/circ/waitingreserves.pl?allbranches=1",

      :biblio_detail => "/cgi-bin/koha/catalogue/detail.pl?biblionumber=",
      :issue_history => "/cgi-bin/koha/catalogue/issuehistory.pl?biblionumber=",
      :cataloguing => "/cgi-bin/koha/cataloguing/addbooks.pl",
      :add_item => "/cgi-bin/koha/cataloguing/additem.pl?biblionumber=",
      :mod_biblio => "/cgi-bin/koha/cataloguing/addbiblio.pl?biblionumber=",

      # admin
      :admin    => "/cgi-bin/koha/admin/admin-home.pl",
      :authorised_values => "/cgi-bin/koha/admin/authorised_values.pl",
      :branches => "/cgi-bin/koha/admin/branches.pl",
      :item_types => "/cgi-bin/koha/admin/itemtypes.pl",
      :patron_categories => "/cgi-bin/koha/admin/categories.pl",
      :search_preferences => "/cgi-bin/koha/admin/preferences.pl?op=search&searchfield=",
      :koha2marc_mapping => "/cgi-bin/koha/admin/koha2marclinks.pl?op=add_form&tablename=",
      :circulation_rules => "/cgi-bin/koha/admin/smart-rules.pl",

      # tools
      :patron_import => "/cgi-bin/koha/tools/import_borrowers.pl",
      :stage_marc => "/cgi-bin/koha/tools/stage-marc-import.pl",

      # svc
      :svc_auth => "/cgi-bin/koha/svc/authentication?",
      :search_patrons => "/cgi-bin/koha/svc/members/search",
      :preferences => "/cgi-bin/koha/svc/config/systempreferences/",

      # koha rest api
      :koha_rest_api => "/api/v1/"
      }
    raise ArgumentError, "Invalid or missing path argument" unless path && paths[path.to_sym]
    "http://xkoha:#{port(:koha_intra)}#{paths[path.to_sym]}"
  end

  def catalinker(path=nil)
    paths = {
        :home => "/cataloguing_old",
        :work => "/work",
        :publication => "/publication",
        :person => "/person",
        :workflow => "/cataloguing?template=workflow&hasWorkType=Literature&hasMediaType=Book&openTab=0&externalSource=random_bibbi&externalSource=random_loc&noStartGrowl=true&language=no&noOnloadWarning=true",
        :workflow_music => "/cataloguing?template=workflow&hasWorkType=Music&hasMediaType=MusicRecording&openTab=0&externalSource=random_bibbi&externalSource=random_loc&noStartGrowl=true&language=no&noOnloadWarning=true",
        :place => "/place",
        :serial => "/serial",
        :work_series=> "/workSeries",
        :corporation => "/corporation",
        :subject => "/subject",
        :landing_page_auth_maintenance => "/cataloguing?template=menu&openTab=1&externalSource=random_bibbi&externalSource=random_loc&noStartGrowl=true&language=no&noOnloadWarning=true"
    }
    raise ArgumentError, "Invalid or missing path argument" unless path && paths[path.to_sym]
    "http://#{ENV['CATALINKER_HOST'] || 'catalinker'}:#{port(:catalinker)}#{paths[path.to_sym]}"
  end

  def patron_client(path=nil)
    paths = {
      work: '/work',
      person: '/person',
      profile: '/profile',
      loansAndReservations: '/profile/loans',
      settings: '/profile/settings',
      user_info: '/profile/info'
    }
    raise ArgumentError, "Invalid or missing path argument" unless path && paths[path.to_sym]
    "http://patron_client:#{port(:patron_client)}#{paths[path.to_sym]}"
  end

  def patron_client_search_page()
    "http://patron_client:#{port(:patron_client)}/?includeWithoutItems"
  end

  def services(path=nil)
    paths = {
      :work => "/work",
      :publication => "/publication"
    }
    raise ArgumentError, "Invalid or missing path argument" unless path && paths[path.to_sym]
    "http://services:#{port(:services)}#{paths[path.to_sym]}"
  end

  def triplestore(path=nil)
    paths = {
      :work => "/sparql"
    }
    raise ArgumentError, "Invalid or missing path argument" unless path && paths[path.to_sym]
    "http://fuseki:#{port(:triplestore)}#{paths[path.to_sym]}"
  end

end
