# CLEANUP KOHA AND RESET CHANGES IN DB
{% from "migration-new/migration-docker-run-command.sls-fragment" import migration with context %}

{{ migration("koha_reset", {"mysql_import": {"file":"/migration/sql/reset.sql"} }) }}
{{ migration("koha_cleanup", {"mysql_import": {"file":"/migration/sql/cleanup.sql"} }) }}
{{ migration("clear_fuseki", {
	"curl_cmd": {
		'method': "POST",
		'url': "http://{0}:{1}".format(pillar['redef']['triplestore']['host'],pillar['redef']['triplestore']['port']) + "/ds/update",
		'params': "--data-urlencode update='clear default'" }
	})
}}

{{ migration("clear_elasticsearch", {
	"curl_cmd": {
		'method': "DELETE",
		'url': "http://{0}:{1}".format(pillar['redef']['elasticsearch']['host'],pillar['redef']['elasticsearch']['http']['port']) +"/search" }
	})
}}

{{ migration("import_mappings", {
	"curl_upload": {
		'method': "POST",
		'url': "http://{0}:{1}".format(pillar['redef']['elasticsearch']['host'],pillar['redef']['elasticsearch']['http']['port']) + "/search",
		'file': "/configuration_data/search_mapping.json" }
	})
}}
