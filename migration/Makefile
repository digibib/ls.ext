
# Variables
# =========

ifdef NOVAGRANT
HOST ?= localhost
else
HOST ?= 192.168.50.12
endif
KOHA_INSTANCE ?= name
LIMIT ?= -1
SKIP ?= 0
DATASET ?= example
MIGRATION_DATA=$(shell pwd)/example_data
ifeq ($(DATASET),full)
    MIGRATION_DATA=$(shell pwd)/data
endif
MIGRATION_RUN_CMD=sudo docker run --net=dockercompose_backend --rm -v $(shell pwd)/out:/out -v $(MIGRATION_DATA):/data dockercompose_migration bash -c
VMARC=$(shell ls -1 $(MIGRATION_DATA)/*vmarc.*.txt | xargs basename)
EXEMP=$(shell ls -1 $(MIGRATION_DATA)/*exemp.*.txt | xargs basename)
LAANER=$(shell ls -1 $(MIGRATION_DATA)/*laaner.*.txt | xargs basename)
LMARC=$(shell ls -1 $(MIGRATION_DATA)/*lmarc.*.txt | xargs basename)
LNEL=$(shell ls -1 $(MIGRATION_DATA)/*lnel.*.txt | xargs basename)
MYSQL_CMD=mysql --local-infile=1 --default-character-set=utf8 -h koha_mysql -u$$MYSQL_USER -p$$MYSQL_PASSWORD $$MYSQL_DATABASE

# Tasks
# =====

.PHONY: all clean rebuild verify staff

all: out/done.koha_fuseki_sync

rebuild:
	@sudo docker-compose -f ../docker-compose/docker-compose.yml build --no-cache migration

debug: # Spin up a migration container and enter it
	@MIGRATION_RUN_CMD=sudo docker run --net=dockercompose_backend --rm  -it -v $(shell pwd)/out:/out -v $(MIGRATION_DATA):/data dockercompose_migration bash

clean:
	@rm -f out/*

out/done.massage_input_data:
	@echo "   Massaging and transforming input data (Bibliofil exports)"
	@$(MIGRATION_RUN_CMD) "catmassage -outdir=/out -vmarc=/data/$(VMARC) -exemp=/data/$(EXEMP) -limit=$(LIMIT) -skip=$(SKIP)"
	@echo "OK Done massaging\n"
	@touch out/done.massage_input_data

out/done.setup_koha: out/done.massage_input_data
	@echo "   Setting up Koha"
	@echo "-- Populating branches"
	@$(MIGRATION_RUN_CMD) '$(MYSQL_CMD) < /out/branches.sql'
	@echo "-- Populating itemtypes"
	@$(MIGRATION_RUN_CMD) '$(MYSQL_CMD) < /out/itypes.sql'
	@echo "-- Populating authorized values"
	@$(MIGRATION_RUN_CMD) '$(MYSQL_CMD) < /out/avalues.sql'
	@cp sql/*.sql out/
	@echo "-- Populating table defining extended patron attribute types"
	@$(MIGRATION_RUN_CMD) '$(MYSQL_CMD) < /out/setup_extended_patron_attributes.sql'
	@echo "-- Truncating tables: zebraqueue, biblio, bibliotiems, items and issues"
	@$(MIGRATION_RUN_CMD) '$(MYSQL_CMD) -e "SET foreign_key_checks=0;TRUNCATE TABLE zebraqueue;TRUNCATE TABLE biblioitems;TRUNCATE TABLE biblio;TRUNCATE TABLE items;TRUNCATE TABLE issues;SET foreign_key_checks=1;"'
	@echo "OK Done setting up Koha\n"
	@touch out/done.setup_koha

out/done.migrate_catalogue_to_koha: out/done.setup_koha
	@echo "   Migration catalogue with items into Koha"
	@echo "-- Stopping Zebra indexer"
	@sudo docker exec koha /bin/sh -c 'sudo koha-stop-zebra $$KOHA_INSTANCE'
	@echo "-- Clearing Zebra index"
	-@sudo docker exec koha /bin/sh -c 'koha-shell $$KOHA_INSTANCE -c "zebraidx -c /etc/koha/sites/$$KOHA_INSTANCE/zebra-biblios.cfg drop biblios"' 2> /dev/null
	-@sudo docker exec koha /bin/sh -c 'koha-shell $$KOHA_INSTANCE -c "zebraidx -c /etc/koha/sites/$$KOHA_INSTANCE/zebra-biblios.cfg commit"' 2> /dev/null
	@sudo docker run --net=dockercompose_backend --rm -v dockercompose_koha_state:/data -v $(shell pwd)/out:/out busybox cp /out/catalogue.mrc /data/
	@echo "-- Importing to Koha with bulkmarcimport"
	@sudo docker exec koha koha-shell -c "/usr/share/koha/bin/migration_tools/bulkmarcimport.pl -b -file /var/lib/state/catalogue.mrc -commit 1000" $(KOHA_INSTANCE)
	@echo "-- Updating biblionumbers (so that biblionumber=tittelnummer)"
	@cp sql/*.sql out/
	@$(MIGRATION_RUN_CMD) '$(MYSQL_CMD) < /out/update_biblionumbers.sql'
	@echo "-- Updating biblioitems.marcxml 999 with changed biblioitemnumber"
	@$(MIGRATION_RUN_CMD) '$(MYSQL_CMD) < /out/update_marcxml_999.sql'
	@echo "-- Starting Zebra indexer"
	@sudo docker exec koha /bin/sh -c 'sudo koha-start-zebra $$KOHA_INSTANCE'
	@echo "OK Done importing catalogue into Koha\n"
	@touch out/done.migrate_catalogue_to_koha

out/done.convert_catalogue_to_nt: out/done.massage_input_data
	@echo "   Converting catalogue to RDF with migmarc2rdf"
	@cp config_data/mapping.yaml out/
	@$(MIGRATION_RUN_CMD) "cd /usr/src/migmarc2rdf && sed -i s/placeholder.com/$(HOST):8005/ /out/mapping.yaml && ruby marc2rdf.rb -m /out/mapping.yaml -i /out/catalogue.marcxml -h $(HOST):8005 > /out/catalogue.nt" 2> /dev/null
	@echo "OK Done initial conversion of catalogue to RDF\n"
	@touch out/done.convert_catalogue_to_nt

VIRTUOSO=http://$(HOST):8890
out/done.import_into_fuseki: out/done.convert_catalogue_to_nt
	@echo "   Importing RDF into LSEXT (Fuseki)"
	@echo "-- Stopping and removing temprorary virtuoso triplestore (if present)"
	-@sudo docker stop virtuoso > /dev/null
	-@sudo docker rm virtuoso > /dev/null
	@echo "-- Starting temporary virtuoso triplestore"
	@sudo docker run -d --net=dockercompose_backend --name=virtuoso -p 8890:8890 digibib/virtuoso > /dev/null
	@echo "-- Waiting until virtuoso is ready"
	@until $$(curl --output /dev/null --silent --head --fail $(VIRTUOSO)/sparql); do printf '.' ; sleep 2 ; done ; printf "\n"
	@echo "-- Splitting catalogue.nt into chunks"
	@split --lines 250000 out/catalogue.nt out/dumps
	@echo "-- Importing chunks into virtuoso"
	@for f in out/dumps* ; do \
	curl -s -w "   %{time_total}s\n" -X POST --digest -u dba:dba -H Content-Type:application/n-triples -T $$f \
		-G $(VIRTUOSO)/sparql-graph-crud-auth --data-urlencode graph=http://deichman.no/migration ; sleep 3 ; done
	@echo "-- Running SPARQL queries to massage resources (create works & relationships)"
	@ls sparql/*.sparql | xargs sed -e s/__HOST__/$(HOST):8005/g | sudo docker exec -i virtuoso /virtuoso/bin/isql -U dba -P dba > /dev/null # TODO minimize output from isql
	@echo "-- Constructing the complete RDF resources to be migrated (resources.nt)"
	@$(MIGRATION_RUN_CMD) 'construct -se=http://$(HOST):8005 -ve=http://virtuoso:8890/sparql > /out/resources.nt'
	@echo "-- Splitting resources.nt into chunks"
	@split --additional-suffix=.nt --lines 250000 out/resources.nt out/complete
	@echo "-- Clearing default graph in Fuseki"
	@$(MIGRATION_RUN_CMD) 'curl -s -X POST --data-urlencode update="clear default" http://fuseki:3030/ds/update' > /dev/null
	@echo "-- Importing chunks into Fuseki"
	@$(MIGRATION_RUN_CMD) 'for f in /out/complete* ; do curl -s  -o /dev/null -w "   %{time_total}s\n" -X POST fuseki:3030/ds/upload -F grap=default -F $$f=@$$f ; done'
	@#echo "-- Stopping and removing temprorary virtuoso triplestore"
	@#sudo docker stop virtuoso
	@#sudo docker rm virtuoso
	@touch out/done.import_into_fuseki
	@echo "OK Completed RDF import to Fuseki\n"

out/done.koha_fuseki_sync: out/done.migrate_loans out/done.import_into_fuseki
	@echo "   Syncing Koha and Fuseki"
	@echo "-- Synchronizing holdingbranches from Koha to Fuseki"
	@$(MIGRATION_RUN_CMD) '$(MYSQL_CMD) -N -B -e "SELECT biblioitemnumber,GROUP_CONCAT(DISTINCT holdingbranch) FROM items GROUP BY biblioitemnumber ;" > /out/holdingbranches.tsv'
	@$(MIGRATION_RUN_CMD) "syncbranches -h=$(HOST):8005 -i=/out/holdingbranches.tsv > /out/holdingbranches.sparql"
	@$(MIGRATION_RUN_CMD) 'curl -s -w "   %{time_total}s\n" -X POST -H "Content-Type: application/sparql-update" -d @/out/holdingbranches.sparql fuseki:3030/ds/update'
	@echo "-- Inserting image links"
	@cp config_data/images.csv.gz out/images.csv.gz
	@$(MIGRATION_RUN_CMD) "syncimages -h=$(HOST):8005 -i=/out/images.csv.gz > /out/images.sparql"
	@$(MIGRATION_RUN_CMD) 'curl -s -w "   %{time_total}s\n" -X POST -H "Content-Type: application/sparql-update" -d @/out/images.sparql fuseki:3030/ds/update'
	@echo "OK Done syncing.\n"
	@touch out/done.koha_fuseki_sync
	@echo "-- Starting indexing resources in Elasticsearch..."
	@$(MIGRATION_RUN_CMD) 'curl -s -X POST services:8005/search/clear_index'
	@$(MIGRATION_RUN_CMD) 'curl -s -X POST services:8005/search/work/reindex_all'
	@$(MIGRATION_RUN_CMD) 'curl -s -X POST services:8005/search/place/reindex_all'
	@$(MIGRATION_RUN_CMD) 'curl -s -X POST services:8005/search/genre/reindex_all'
	@$(MIGRATION_RUN_CMD) 'curl -s -X POST services:8005/search/subject/reindex_all'
	@echo "   Migration is complete. Goodbye!"
	@echo "!! TODO stop running virtuoso container (left up for debugging)"

out/done.migrate_patrons: out/done.setup_koha
ifdef MIGRATE_PATRONS
	@echo "   Migrating patrons to Koha"
	@echo "-- Merging information from laaner, lmarc and lnel dumps"
	@$(MIGRATION_RUN_CMD) "patronmassage -lmarc=/data/$(LMARC) -laaner=/data/$(LAANER) -lnel=/data/$(LNEL) -outdir=/out"
	@echo "-- Inserting patron categories into MySQL"
	@$(MIGRATION_RUN_CMD) '$(MYSQL_CMD) < /out/categories.sql'
	@echo "-- Inserting patron home branches into MySQL"
	@$(MIGRATION_RUN_CMD) '$(MYSQL_CMD) < /out/homebranches.sql'
	@echo "-- Truncating tables borrowers, borrower_attributes, borrower_message_preferences, borrower_message_transport_preferences, borrower_sync"
	@$(MIGRATION_RUN_CMD) '$(MYSQL_CMD) -e "SET foreign_key_checks=0;TRUNCATE TABLE borrower_attributes;TRUNCATE TABLE borrowers;TRUNCATE TABLE borrower_message_preferences;TRUNCATE TABLE borrower_message_transport_preferences;TRUNCATE TABLE borrower_sync;SET foreign_key_checks=1;"'
	@echo "-- Recreating API user (since we just truncated borrowers table)"
	@sudo docker exec services bash -c "/entrypoint.sh & PID=\$$! && sleep 1 && kill \$$PID" 2> /dev/null
	@echo "-- Importing patrons to Koha"
	@cp sql/*.sql out/
	@$(MIGRATION_RUN_CMD) '$(MYSQL_CMD) < /out/import_patrons.sql'
	@echo "-- Setting patron expiry date far into the future"
	@$(MIGRATION_RUN_CMD) '$(MYSQL_CMD) -e "UPDATE borrowers SET dateexpiry=\"2099-01-01\";"'
	@echo "-- Migrating patron message transport preferences"
	@$(MIGRATION_RUN_CMD) '$(MYSQL_CMD) < /out/msgprefs.sql'
	@echo "-- Inserting extended patron attributes (fnr)"
	@$(MIGRATION_RUN_CMD) '$(MYSQL_CMD) < /out/ext.sql'
	@echo "!! Inserting NL syncrhonization status (TODO needs more investigation)"
	@$(MIGRATION_RUN_CMD) '$(MYSQL_CMD) -e "INSERT INTO borrower_sync (borrowernumber, synctype, sync, syncstatus) SELECT borrowernumber, \"norwegianpatrondb\",1,\"new\" FROM borrower_attributes WHERE code=\"fnr\";"'
	@echo "OK Done migrating patrons.\n"
endif
	@touch out/done.migrate_patrons

out/done.migrate_loans: out/done.migrate_patrons out/done.migrate_catalogue_to_koha
ifdef MIGRATE_PATRONS
	@echo "   Migrating active loans to Koha"
	@$(MIGRATION_RUN_CMD) '$(MYSQL_CMD) < /out/issues.sql'
	@echo "OK Done migrating loans\n"
	@touch out/done.migrate_loans
endif

verify:
	@echo "   Verifying migration"
	@$(MIGRATION_RUN_CMD) verify

staff:
	@echo "   Importing staff users"
	@echo "-- Populating table defining extended patron attribute types"
	@$(MIGRATION_RUN_CMD) '$(MYSQL_CMD) < /out/setup_extended_patron_attributes.sql'
	@echo "-- Merging information from laaner, lmarc and lnel dumps"
	@$(MIGRATION_RUN_CMD) "patronmassage -staff=true -lmarc=/data/$(LMARC) -laaner=/data/$(LAANER) -lnel=/data/$(LNEL) -outdir=/out"
	@echo "-- Inserting patron categories into MySQL"
	@$(MIGRATION_RUN_CMD) '$(MYSQL_CMD) < /out/categories.sql'
	@echo "-- Inserting patron home branches into MySQL"
	@$(MIGRATION_RUN_CMD) '$(MYSQL_CMD) < /out/homebranches.sql'
	@echo "-- Truncating tables borrowers, borrower_attributes, borrower_message_preferences, borrower_message_transport_preferences, borrower_sync"
	@$(MIGRATION_RUN_CMD) '$(MYSQL_CMD) -e "SET foreign_key_checks=0;TRUNCATE TABLE borrower_attributes;TRUNCATE TABLE borrowers;TRUNCATE TABLE borrower_message_preferences;TRUNCATE TABLE borrower_message_transport_preferences;TRUNCATE TABLE borrower_sync;SET foreign_key_checks=1;"'
	@echo "-- Recreating API user (since we just truncated borrowers table)"
	@sudo docker exec services bash -c "/entrypoint.sh & PID=\$$! && sleep 1 && kill \$$PID" 2> /dev/null
	@echo "-- Importing patrons to Koha"
	@cp sql/*.sql out/
	@$(MIGRATION_RUN_CMD) '$(MYSQL_CMD) < /out/import_patrons.sql'
	@echo "-- Granting staff permissions (all superusers for now; TODO differentiate)"
	@$(MIGRATION_RUN_CMD) '$(MYSQL_CMD) -e "UPDATE borrowers SET flags=1;"'
	@echo "-- Setting staff expiry date far into the future"
	@$(MIGRATION_RUN_CMD) '$(MYSQL_CMD) -e "UPDATE borrowers SET dateexpiry=\"2099-01-01\";"'
	@echo "-- Migrating patron message transport preferences"
	@$(MIGRATION_RUN_CMD) '$(MYSQL_CMD) < /out/msgprefs.sql'
	@echo "-- Inserting extended patron attributes (fnr)"
	@$(MIGRATION_RUN_CMD) '$(MYSQL_CMD) < /out/ext.sql'
	@echo "!! Inserting NL syncrhonization status (TODO needs more investigation)"
	@$(MIGRATION_RUN_CMD) '$(MYSQL_CMD) -e "INSERT INTO borrower_sync (borrowernumber, synctype, sync, syncstatus) SELECT borrowernumber, \"norwegianpatrondb\",1,\"new\" FROM borrower_attributes WHERE code=\"fnr\";"'
	@echo "OK Done migrating staff.\n"