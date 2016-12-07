
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
EMARC=$(shell ls -1 $(MIGRATION_DATA)/*emarc.*.txt | xargs basename)
LAANER=$(shell ls -1 $(MIGRATION_DATA)/*laaner.*.txt | xargs basename)
LMARC=$(shell ls -1 $(MIGRATION_DATA)/*lmarc.*.txt | xargs basename)
LNEL=$(shell ls -1 $(MIGRATION_DATA)/*lnel.*.txt | xargs basename)
RES=$(shell ls -1 $(MIGRATION_DATA)/*res.*.txt | xargs basename)
MYSQL_CMD=mysql --local-infile=1 --default-character-set=utf8 -h koha_mysql -u$$MYSQL_USER -p$$MYSQL_PASSWORD $$MYSQL_DATABASE
TIMEIT=/usr/bin/time -f"   %es"
ifeq ($(shell uname -s), Darwin)
TIMEIT=/usr/bin/time
endif

# Tasks
# =====

.PHONY: all clean rebuild verify staff virtuoso reindex settings transactions

all: out/done.koha_fuseki_sync

rebuild:
	@sudo docker-compose -f ../docker-compose/docker-compose.yml build --no-cache migration

debug: # Spin up a migration container and enter it
	@MIGRATION_RUN_CMD=sudo docker run --net=dockercompose_backend --rm  -it -v $(shell pwd)/out:/out -v $(MIGRATION_DATA):/data dockercompose_migration bash

clean:
	@rm -f out/*

settings:
	@echo "   Loading Koha preferences and predefined values"
	@bash -c "source ../docker-compose/docker-compose.env && source ../docker-compose/secrets.env && export HOST=$(HOST) && \
	for f in config_data/*.csv ; do envsubst < \$$f > out/\$$(basename \$$f) ; done"
	@cp sql/*.sql out/
	@echo "-- Loading system preferences"
	@$(MIGRATION_RUN_CMD) '$(MYSQL_CMD) < /out/sysprefs.sql'
	@echo "-- Loading column visibility settings"
	@$(MIGRATION_RUN_CMD) '$(MYSQL_CMD) < /out/columns.sql'
	@echo "-- Importing static libraries"
	@$(MIGRATION_RUN_CMD) '$(MYSQL_CMD) < /out/static_libraries.sql'
	@echo "-- Importing static categories"
	@$(MIGRATION_RUN_CMD) '$(MYSQL_CMD) < /out/static_categories.sql'
	@echo "-- Importing static users"
	@$(MIGRATION_RUN_CMD) '$(MYSQL_CMD) < /out/static_users.sql'
	@echo "-- Populating authorized values"
	@$(MIGRATION_RUN_CMD) '$(MYSQL_CMD) < /out/avalues.sql'
	@echo "OK Done setting up Koha\n"

out/done.massage_input_data:
	@date
	@echo "   Massaging and transforming input data (Bibliofil exports)"
	@$(TIMEIT) $(MIGRATION_RUN_CMD) "catmassage -marcxml -outdir=/out -vmarc=/data/$(VMARC) -emarc=/data/$(EMARC) -exemp=/data/$(EXEMP) -limit=$(LIMIT) -skip=$(SKIP)"
	@echo "OK Done massaging\n"
	@touch out/done.massage_input_data

out/done.setup_koha: out/done.massage_input_data
ifndef NOKOHA
	@date
	@echo "   Setting up Koha"
	@echo "-- Populating branches"
	@$(MIGRATION_RUN_CMD) '$(MYSQL_CMD) < /out/branches.sql'
	@echo "-- Populating itemtypes"
	@$(MIGRATION_RUN_CMD) '$(MYSQL_CMD) < /out/itypes.sql'
	@echo "-- Populating Koha with static configuration data"
	@cp config_data/* out/
	@cp sql/*.sql out/
	#@wget -q http://static.deichman.no/koha/setup.sql -O out/setup.sql
	#@echo "-- Loading MARC-framework and notices"
	#@$(MIGRATION_RUN_CMD) '$(MYSQL_CMD) < /out/setup.sql'
	@echo "-- Populating authorized values"
	@$(MIGRATION_RUN_CMD) '$(MYSQL_CMD) < /out/avalues.sql'
	@echo "-- Populating table defining extended patron attribute types"
	@$(MIGRATION_RUN_CMD) '$(MYSQL_CMD) < /out/setup_extended_patron_attributes.sql'
	@echo "-- Creating age restriction link to marc 521a"
	@$(MIGRATION_RUN_CMD) '$(MYSQL_CMD) < /out/setup_age_restriction.sql'
	@echo "-- Truncating tables: zebraqueue, biblio, bibliotiems, items, issues and reserves"
	@$(MIGRATION_RUN_CMD) '$(MYSQL_CMD) -e "SET foreign_key_checks=0;TRUNCATE TABLE zebraqueue;TRUNCATE TABLE biblioitems;TRUNCATE TABLE biblio;TRUNCATE TABLE items;TRUNCATE TABLE issues;TRUNCATE TABLE reserves;SET foreign_key_checks=1;"'
endif
	@touch out/done.setup_koha

out/done.migrate_catalogue_to_koha: out/done.setup_koha
ifndef NOKOHA
	@date
	@echo "   Migration catalogue with items into Koha"
	@echo "-- Stopping Cron"
	@sudo docker exec xkoha /bin/sh -c 'supervisorctl -u$$KOHA_ADMINUSER -p$$KOHA_ADMINPASS stop cron'
	@echo "-- Stopping Zebra indexer"
	@sudo docker exec xkoha /bin/sh -c 'supervisorctl -u$$KOHA_ADMINUSER -p$$KOHA_ADMINPASS stop zebra_indexer'
	@echo "-- Clearing Zebra index"
	-@sudo docker exec xkoha /bin/sh -c 'koha-shell $$KOHA_INSTANCE -c "zebraidx -c /etc/koha/sites/$$KOHA_INSTANCE/zebra-biblios.cfg drop biblios"' 2> /dev/null
	-@sudo docker exec xkoha /bin/sh -c 'koha-shell $$KOHA_INSTANCE -c "zebraidx -c /etc/koha/sites/$$KOHA_INSTANCE/zebra-biblios.cfg commit"' 2> /dev/null
	@sudo docker run --net=dockercompose_backend --rm -v dockercompose_koha_state:/data -v $(shell pwd)/out:/out busybox cp /out/catalogue.mrc /data/
	@echo "-- Importing to Koha with bulkmarcimport"
	@sudo docker exec xkoha koha-shell -c "/usr/share/koha/bin/migration_tools/bulkmarcimport.pl -m MARCXML -b -framework DCHM -file /var/lib/state/catalogue.mrc -commit 1000" $(KOHA_INSTANCE)
	@echo "OK Done importing catalogue into Koha\n"
endif
	@touch out/done.migrate_catalogue_to_koha

out/done.messing_with_migrated_catalogue: out/done.migrate_catalogue_to_koha
ifndef NOKOHA
	@date
	@echo "   Messing with the migrated catalogue in Koha"
	@echo "-- Updating biblionumbers (so that biblionumber=tittelnummer)"
	@cp sql/*.sql out/
	@$(TIMEIT) $(MIGRATION_RUN_CMD) '$(MYSQL_CMD) < /out/update_biblionumbers.sql'
	@echo "-- Updating biblioitems.marcxml 999 with changed biblioitemnumber"
	@$(TIMEIT) $(MIGRATION_RUN_CMD) '$(MYSQL_CMD) < /out/update_marcxml_999.sql'
	@echo "-- Starting Cron"
	@sudo docker exec xkoha /bin/sh -c 'supervisorctl -u$$KOHA_ADMINUSER -p$$KOHA_ADMINPASS start cron'
	@echo "OK Done messing with catalogue\n"
endif
	@touch out/done.messing_with_migrated_catalogue

out/done.convert_catalogue_to_nt: out/done.massage_input_data
	@date
	@echo "   Converting catalogue to RDF with migmarc2rdf"
	@cp config_data/mapping.yaml out/
	@$(TIMEIT) $(MIGRATION_RUN_CMD) "cd /usr/src/migmarc2rdf && ruby marc2rdf.rb -m /out/mapping.yaml -i /out/catalogue.marcxml -h data.deichman.no > /out/catalogue.nt"
	@echo "OK Done initial conversion of catalogue to RDF\n"
	@touch out/done.convert_catalogue_to_nt

VIRTUOSO=http://$(HOST):8890
out/done.import_into_fuseki: out/done.convert_catalogue_to_nt
	@date
	@echo "   Importing RDF into LSEXT (Fuseki)"
	@echo "-- Stopping and removing temprorary virtuoso triplestore (if present)"
	-@sudo docker stop virtuoso > /dev/null
	-@sudo docker rm virtuoso > /dev/null
	@echo "-- Starting temporary virtuoso triplestore"
	@sudo docker run -d --net=dockercompose_backend --name=virtuoso -p 8890:8890 digibib/virtuoso > /dev/null
	@echo "-- Waiting until virtuoso is ready"
	@until $$(curl --output /dev/null --silent --head --fail $(VIRTUOSO)/sparql); do printf '.' ; sleep 2 ; done ; printf "\n"
	@echo "-- Splitting catalogue.nt into chunks"
	@$(MIGRATION_RUN_CMD) 'split --lines 250000 /out/catalogue.nt /out/dumps'
	@echo "-- Importing chunks into virtuoso"
	@for f in out/dumps* ; do \
	curl -s -w "   %{time_total}s\n" -X POST --digest -u dba:dba -H Content-Type:application/n-triples -T $$f \
		-G $(VIRTUOSO)/sparql-graph-crud-auth --data-urlencode graph=http://deichman.no/migration ; sleep 3 ; done
	@echo "-- Running SPARQL queries to massage resources (create works & relationships)"
	@ls sparql/*.sparql | xargs cat | sudo docker exec -i virtuoso /virtuoso/bin/isql -U dba -P dba | sed 's/^SQL.*//g' | grep .
	@echo "-- Constructing the complete RDF resources to be migrated (resources.nt)"
	@cp config_data/constructs.sparql out/
	@$(MIGRATION_RUN_CMD) 'construct -n=3 -se=http://services:8005 -ve=http://virtuoso:8890/sparql > /out/resources.nt'
	@echo "-- Anonymizing blank nodes"
	@$(TIMEIT) $(MIGRATION_RUN_CMD) 'nt2ttl -f=/out/resources.nt > /out/resources.ttl'
	@echo "-- Splitting resources.ttl into chunks"
	@$(MIGRATION_RUN_CMD) 'split --additional-suffix=.ttl --lines 250000 /out/resources.ttl /out/complete'
	@echo "-- Clearing default graph in Fuseki"
	@$(MIGRATION_RUN_CMD) 'curl -s -X POST --data-urlencode update="clear default" http://fuseki:3030/ds/update' > /dev/null
	@echo "-- Importing chunks into Fuseki"
	@$(MIGRATION_RUN_CMD) 'for f in /out/complete* ; do curl -s  -o /dev/null -w "   %{time_total}s\n" -X POST fuseki:3030/ds/upload -F grap=default -F $$f=@$$f ; done'
	@#echo "-- Stopping and removing temprorary virtuoso triplestore"
	@#sudo docker stop virtuoso
	@#sudo docker rm virtuoso
	@touch out/done.import_into_fuseki
	@echo "OK Completed RDF import to Fuseki\n"

virtuoso: out/done.convert_catalogue_to_nt
	@date
	@echo "   Importing RDF into Virtuoso (without running SPARQL rules)"
	@echo "-- Stopping and removing temprorary virtuoso triplestore (if present)"
	-@sudo docker stop virtuoso > /dev/null
	-@sudo docker rm virtuoso > /dev/null
	@echo "-- Starting temporary virtuoso triplestore"
	@sudo docker run -d --net=dockercompose_backend --name=virtuoso -p 8890:8890 digibib/virtuoso > /dev/null
	@echo "-- Waiting until virtuoso is ready"
	@until $$(curl --output /dev/null --silent --head --fail $(VIRTUOSO)/sparql); do printf '.' ; sleep 2 ; done ; printf "\n"
	@echo "-- Splitting catalogue.nt into chunks"
	@$(MIGRATION_RUN_CMD) 'split --lines 250000 /out/catalogue.nt /out/dumps'
	@echo "-- Importing chunks into virtuoso"
	@for f in out/dumps* ; do \
	curl -s -w "   %{time_total}s\n" -X POST --digest -u dba:dba -H Content-Type:application/n-triples -T $$f \
		-G $(VIRTUOSO)/sparql-graph-crud-auth --data-urlencode graph=http://deichman.no/migration ; sleep 3 ; done
	@echo "OK Imported RDF to Virtuoso\n"

out/done.koha_fuseki_sync: out/done.import_into_fuseki out/done.messing_with_migrated_catalogue
ifndef NOKOHA
	@date
	@echo "   Syncing Koha and Fuseki"
	@echo "-- Synchronizing holdingbranches from Koha to Fuseki"
	@$(MIGRATION_RUN_CMD) '$(MYSQL_CMD) -N -B -e "SELECT biblioitemnumber,GROUP_CONCAT(DISTINCT holdingbranch) FROM items GROUP BY biblioitemnumber ;" > /out/holdingbranches.tsv'
	@$(MIGRATION_RUN_CMD) "syncbranches -h=data.deichman.no -i=/out/holdingbranches.tsv > /out/holdingbranches.sparql"
	@$(MIGRATION_RUN_CMD) 'curl -s -w "   %{time_total}s\n" -X POST -H "Content-Type: application/sparql-update" -d @/out/holdingbranches.sparql fuseki:3030/ds/update'
	@echo "-- Inserting image links"
	@cp config_data/images.csv.gz out/images.csv.gz
	@$(MIGRATION_RUN_CMD) "syncimages -h=data.deichman.no -i=/out/images.csv.gz > /out/images.sparql"
	@$(MIGRATION_RUN_CMD) 'curl -s -w "   %{time_total}s\n" -X POST -H "Content-Type: application/sparql-update" -d @/out/images.sparql fuseki:3030/ds/update'
	@echo "OK Done syncing.\n"
	@touch out/done.koha_fuseki_sync
endif
	@echo "-- Starting indexing resources in Elasticsearch..."
	@$(MIGRATION_RUN_CMD) 'curl -s -X POST services:8005/search/clear_index'
	@$(MIGRATION_RUN_CMD) 'curl -s -X POST services:8005/search/publication/reindex_all'
	@$(MIGRATION_RUN_CMD) 'curl -s -X POST services:8005/search/work/reindex_all?ignoreConnectedResources=true'
	@$(MIGRATION_RUN_CMD) 'curl -s -X POST services:8005/search/person/reindex_all?ignoreConnectedResources=true'
	@$(MIGRATION_RUN_CMD) 'curl -s -X POST services:8005/search/corporation/reindex_all?ignoreConnectedResources=true'
	@$(MIGRATION_RUN_CMD) 'curl -s -X POST services:8005/search/place/reindex_all'
	@$(MIGRATION_RUN_CMD) 'curl -s -X POST services:8005/search/genre/reindex_all'
	@$(MIGRATION_RUN_CMD) 'curl -s -X POST services:8005/search/subject/reindex_all'
	@$(MIGRATION_RUN_CMD) 'curl -s -X POST services:8005/search/serial/reindex_all'
	@$(MIGRATION_RUN_CMD) 'curl -s -X POST services:8005/search/compositionType/reindex_all'
	@$(MIGRATION_RUN_CMD) 'curl -s -X POST services:8005/search/event/reindex_all'
	@$(MIGRATION_RUN_CMD) 'curl -s -X POST services:8005/search/workseries/reindex_all'
	@echo "-- Start syncing MARC records..."
	@$(MIGRATION_RUN_CMD) 'curl -s -X PUT services:8005/publication/sync_all'
	@echo "   Migration is complete. Goodbye!"
	@date
	@echo "!! TODO stop running virtuoso container (left up for debugging)"

temp:
	@$(MIGRATION_RUN_CMD) 'curl -s -X PUT services:8005/publication/sync_all'

out/done.migrate_patrons:
	@echo "   Migrating patrons to Koha"
	@echo "-- Disabeling koha email sending"
	@sudo docker exec xkoha /bin/sh -c 'koha-email-disable $$KOHA_INSTANCE'
	@echo "-- Merging information from laaner, lmarc and lnel dumps"
	@$(MIGRATION_RUN_CMD) "patronmassage -lmarc=/data/$(LMARC) -laaner=/data/$(LAANER) -lnel=/data/$(LNEL) -outdir=/out"
	@echo "-- Inserting patron categories into MySQL"
	@$(MIGRATION_RUN_CMD) '$(MYSQL_CMD) < /out/categories.sql'
	@echo "-- Inserting patron home branches into MySQL"
	@$(MIGRATION_RUN_CMD) '$(MYSQL_CMD) < /out/homebranches.sql'
	@echo "-- Truncating tables borrowers, borrower_attributes, borrower_sync, clearing borrower_message_preferences (except for categories)"
	@$(MIGRATION_RUN_CMD) '$(MYSQL_CMD) -e "SET foreign_key_checks=0;TRUNCATE TABLE borrower_attributes;TRUNCATE TABLE borrowers;TRUNCATE TABLE borrower_sync;SET foreign_key_checks=1;"'
	@$(MIGRATION_RUN_CMD) '$(MYSQL_CMD) -e "DELETE FROM borrower_message_preferences WHERE borrowernumber IS NOT NULL;"'
	@echo "-- Recreating static data (since we just truncated borrowers table and more)"
	$(MAKE) settings
	@echo "-- Importing patrons to Koha"
	@cp sql/*.sql out/
	@$(MIGRATION_RUN_CMD) '$(MYSQL_CMD) < /out/import_patrons.sql'
	@echo "-- Setting patron expiry date far into the future"
	@$(MIGRATION_RUN_CMD) '$(MYSQL_CMD) -e "UPDATE borrowers SET dateexpiry=\"2099-01-01\";"'
ifdef EMAIL
	@echo "-- Setting email-adress of all users to: $(EMAIL)"
	@$(MIGRATION_RUN_CMD) '$(MYSQL_CMD) -e "UPDATE borrowers SET email=\"$(EMAIL)\";"'
endif
ifdef PHONE
	@echo "-- Setting smsalertnumber of all users to: $(PHONE)"
	@$(MIGRATION_RUN_CMD) '$(MYSQL_CMD) -e "UPDATE borrowers SET smsalertnumber=\"$(PHONE)\";"'
endif
	@echo "OK Done migrating patrons.\n"
	@touch out/done.migrate_patrons

transactions: out/done.massage_input_data out/done.migrate_patrons
	@echo "   Migrating loans and holds to Koha"
	@echo "-- Inserting issues SQL"
	@$(TIMEIT) $(MIGRATION_RUN_CMD) '$(MYSQL_CMD) < /out/issues.sql'
	@echo "-- Remove item.onloan date on non-matched issues"
	@$(MIGRATION_RUN_CMD) '$(MYSQL_CMD) -e "UPDATE items set onloan=NULL WHERE NOT EXISTS (SELECT * FROM issues WHERE items.itemnumber = issues.itemnumber)"'
	@echo "-- Generating holds SQL"
	@$(TIMEIT) $(MIGRATION_RUN_CMD) "res2sql -res=/data/$(RES) > /out/holds.sql"
	@echo "-- Inserting holds SQL"
	@$(TIMEIT) $(MIGRATION_RUN_CMD) '$(MYSQL_CMD) < /out/holds.sql'
	@echo "-- Setting reserves.found to NULL when not found"
	@$(TIMEIT) $(MIGRATION_RUN_CMD) '$(MYSQL_CMD) -e "UPDATE reserves SET found=NULL WHERE found=\"\""'
	@echo "-- Storing Bibliofil user ID as extended patron attribute"
	@$(MIGRATION_RUN_CMD) '$(MYSQL_CMD) -e "INSERT INTO borrower_attributes (borrowernumber, code, attribute) SELECT borrowernumber, \"old_lnr\", userid  FROM borrowers WHERE categorycode NOT IN (\"API\", \"AUTO\", \"DOOR\"); "'
	@echo "-- Inserting extended patron attributes (fnr)"
	@$(MIGRATION_RUN_CMD) '$(MYSQL_CMD) < /out/ext.sql'
	@echo "-- Inserting NL syncrhonization details in borrower_sync"
	@$(MIGRATION_RUN_CMD) '$(MYSQL_CMD) < /out/borrowersync.sql'
	@$(MIGRATION_RUN_CMD) '$(MYSQL_CMD) < /out/nonlsync.sql'
	@echo "-- Migrating patron message transport preferences"
	@$(MIGRATION_RUN_CMD) '$(MYSQL_CMD) < /out/msgprefs.sql'
	@echo "-- Updating message transport preferences (set want digest for all patrons)"
	@$(MIGRATION_RUN_CMD) '$(MYSQL_CMD) -e "UPDATE borrower_message_preferences SET wants_digest=1 WHERE message_attribute_id=1 OR message_attribute_id=2;"'
	@echo "-- Setting userid=cardid"
	@$(MIGRATION_RUN_CMD) '$(MYSQL_CMD) -e "UPDATE borrowers SET userid=cardnumber WHERE cardnumber IS NOT NULL AND categorycode NOT IN (\"API\", \"AUTO\", \"DOOR\");"'	@echo "OK Done migrating loands and holds\n"
	@echo "-- Enabeling koha email sending"
	@sudo docker exec xkoha /bin/sh -c 'koha-email-enable $$KOHA_INSTANCE'
	@touch out/done.migrate_loans

zebra:
	@echo "-- Populating zebra queue"
	@$(MIGRATION_RUN_CMD) '$(MYSQL_CMD) < /out/populate_zebraqueue.sql'
	@echo "-- Setting MARC framework code on all biblios to DCHM"
	@$(MIGRATION_RUN_CMD) '$(MYSQL_CMD) -e "UPDATE biblio SET frameworkcode=\"DCHM\";"'
	@echo "-- Starting Zebra indexer"
	@sudo docker exec xkoha /bin/sh -c 'supervisorctl -u$$KOHA_ADMINUSER -p$$KOHA_ADMINPASS start zebra_indexer'

ifdef MIGRATE_PATRONS
NOCIRC=false
else
NOCIRC=true
endif
verify:
	@echo "   Verifying migration"
	@$(MIGRATION_RUN_CMD) "verify -nocirc=$(NOCIRC)"

reindex:
	@$(MIGRATION_RUN_CMD) 'curl -s -X POST services:8005/search/clear_index'
	@$(MIGRATION_RUN_CMD) 'curl -s -X POST services:8005/search/publication/reindex_all'
	@$(MIGRATION_RUN_CMD) 'curl -s -X POST services:8005/search/work/reindex_all?ignoreConnectedResources=true'
	@$(MIGRATION_RUN_CMD) 'curl -s -X POST services:8005/search/person/reindex_all?ignoreConnectedResources=true'
	@$(MIGRATION_RUN_CMD) 'curl -s -X POST services:8005/search/corporation/reindex_all?ignoreConnectedResources=true'
	@$(MIGRATION_RUN_CMD) 'curl -s -X POST services:8005/search/place/reindex_all'
	@$(MIGRATION_RUN_CMD) 'curl -s -X POST services:8005/search/genre/reindex_all'
	@$(MIGRATION_RUN_CMD) 'curl -s -X POST services:8005/search/subject/reindex_all'
	@$(MIGRATION_RUN_CMD) 'curl -s -X POST services:8005/search/serial/reindex_all'
	@$(MIGRATION_RUN_CMD) 'curl -s -X POST services:8005/search/compositionType/reindex_all'
