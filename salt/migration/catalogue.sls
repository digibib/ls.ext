# MIGRATE AND IMPORT CATALOGUE

{% from "migration-new/migration-docker-run-command.sls-fragment" import migration with context %}

# PREPARE CATALOGUE
{{ migration("merge_catalogue_and_items", {
	"docker_cmd": "cp data.vmarc*.txt vmarc.txt; cp data.exemp*.txt exemp.txt; merge -vmarc=vmarc.txt -exemp=exemp.txt -split=true -limit=-1"
	})
}}

# MARC2RDF
{{ migration("marc2rdf", {
	"docker_cmd": "cd /migration/marc2rdf && ruby marc2rdf.rb -m mapping.json -d /migration/data/records > /migration/data/fulldump.nt"
	})
}}

# REPLACE PLACEHOLDER.COM
{{ migration("replace_placeholder", {
	"docker_cmd": "sed -i \"s/placeholder.com/" + "{0}:{1}".format(pillar['redef']['services']['host'],pillar['redef']['services']['port']) + "/g\" /migration/data/fulldump.nt"
	})
}}

# DELETE MIGRATION GRAPH
{{ migration("clear_migration_graph", {
	"curl_cmd": {
		'method': "DELETE",
		'url': "http://{0}:{1}".format(pillar['redef']['triplestore']['host'],8890)+"/sparql-graph-crud-auth",
		'digest': "--digest -u dba:" + pillar['koha']['adminpass'],
		'params': "--data-urlencode graph=http://deichman.no/migration" }
	})
}}

# UPLOAD NTRIPLES TO VIRTUOSO
{{ migration("upload_ntriples", {
	"curl_upload": {
		'method': "PUT",
		'url': "http://{0}:{1}".format(pillar['redef']['triplestore']['host'],8890) +"/sparql-graph-crud-auth",
		'digest': "--digest -u dba:" + pillar['koha']['adminpass'],
		'headers': "-H Content-Type:text/turtle",
		'file': "/migration/data/fulldump.nt",
		'params': "--data-urlencode graph=http://deichman.no/migration" }
	})
}}

# GENERATE WORKS
{{ migration("generate_works", {
	"curl_cmd": {
		'method': "GET",
		'pre_cmd': "sed -e 's/__HOST__/" + "{0}:{1}".format(pillar['redef']['services']['host'],pillar['redef']['services']['port']) + "/g' /sparql/001b_generate_works_from_publications.sparql | ",
		'url': "http://{0}:{1}".format(pillar['redef']['triplestore']['host'],8890) + "/sparql",
		'params': "--data-urlencode default-graph-uri=http://deichman.no/migration --data-urlencode query@- ",
		'post_cmd': "-o /migration/data/works_aggregated.ttl" }
	})
}}

# UPLOAD WORKS
{{ migration("upload_works", {
	"curl_upload": {
	    'method': "POST",
		'url': "http://{0}:{1}".format(pillar['redef']['triplestore']['host'], 8890) + "/sparql-graph-crud-auth",
		'digest': "--digest -u dba:"+pillar['koha']['adminpass'],
		'headers': "-H Content-Type:text/turtle",
		'params': "--data-urlencode graph=http://deichman.no/migration",
		'file': "works_aggregated.ttl" }
	})
}}

# DELETE PERSONS ON PUBLICATIONS
{{ migration("delete_publication_persons", {
	"curl_cmd": {
		'method': "POST",
	'pre_cmd': "sed -e 's/__HOST__/" + "{0}:{1}".format(pillar['redef']['services']['host'],pillar['redef']['services']['port']) + "/g' /sparql/002_delete_creator_on_publications.sparql | ",
	'url': "http://{0}:{1}".format(pillar['redef']['triplestore']['host'], 8890) +"/sparql-auth",
	'digest': "--digest -u dba:"+pillar['koha']['adminpass'],
	'params': "--data-urlencode default-graph-uri=http://deichman.no/migration --data-urlencode query@- " }
	})
}}

# MIGRATE
{{ migration("vigrate", {
	"docker_cmd": "vigrate -n=2 -se=" + "http://{0}:{1}".format(pillar['redef']['services']['host'],pillar['redef']['services']['port']) + " -ve=" + "http://{0}:{1}".format(pillar['redef']['triplestore']['host'],8890) + "/sparql-auth -dg=http://deichman.no/migration -user=dba -pass=" + pillar['koha']['adminpass']
	})
}}
