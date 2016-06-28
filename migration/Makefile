
# Variables
# =========

HOST ?= 192.168.50.12:8005
KOHA_INSTANCE ?= name
LIMIT ?= -1
DATASET ?= example
MIGRATION_DATA=$(shell pwd)/example_data
ifeq ($(DATASET),full)
    MIGRATION_DATA=$(shell pwd)/data
endif
MIGRATION_RUN_CMD=sudo docker run --net=dockercompose_backend --rm -v $(shell pwd)/out:/out -v $(MIGRATION_DATA):/data dockercompose_migration bash -c
VMARC=$(shell ls -1 $(MIGRATION_DATA)/*vmarc.*.txt | xargs basename)
EXEMP=$(shell ls -1 $(MIGRATION_DATA)/*exemp.*.txt | xargs basename)
MYSQL_CMD=mysql --default-character-set=utf8 -h koha_mysql -u$$MYSQL_USER -p$$MYSQL_PASSWORD $$MYSQL_DATABASE

# Tasks
# =====

.PHONY: all clean

all: out/done.koha_fuseki_sync

clean:
	@rm -f out/*

out/done.massage_input_data:
	@echo "   Massaging and transforming input data (Bibliofil exports)"
	@$(MIGRATION_RUN_CMD) "catmassage -outdir=/out -vmarc=/data/$(VMARC) -exemp=/data/$(EXEMP) -limit=$(LIMIT)"
	@echo "OK Done massaging\n"
	@touch out/done.massage_input_data

out/done.setup_koha: out/done.massage_input_data
	@echo "   Setting up Koha with branches, itemtypes and authorized values"
	@echo "-- Populating branches"
	@$(MIGRATION_RUN_CMD) '$(MYSQL_CMD) < /out/branches.sql'
	@echo "-- Populating itemtypes"
	@$(MIGRATION_RUN_CMD) '$(MYSQL_CMD) < /out/itypes.sql'
	@echo "-- Populating authorized values"
	@$(MIGRATION_RUN_CMD) '$(MYSQL_CMD) < /out/avalues.sql'
	@echo "-- Truncating tables: zebraqueue, biblio, bibliotiems and items\n"
	@$(MIGRATION_RUN_CMD) '$(MYSQL_CMD) -e "SET foreign_key_checks=0;TRUNCATE zebraqueue;TRUNCATE TABLE biblioitems;TRUNCATE TABLE biblio;TRUNCATE TABLE items;SET foreign_key_checks=1;"'
	@touch out/done.setup_koha

out/done.migrate_catalogue_to_koha: out/done.setup_koha
	@echo "   Migration catalogue with items into Koha"
	@echo "-- Stopping Zebra indexer"
	@sudo docker exec koha_container koha-stop-zebra $$KOHA_INSTANCE
	@echo "-- Clearing Zebra index"
	-@sudo docker exec koha_container /bin/sh -c 'koha-shell $$KOHA_INSTANCE -c "zebraidx -c /etc/koha/sites/$$KOHA_INSTANCE/zebra-biblios.cfg drop biblios"' 2> /dev/null
	-@sudo docker exec koha_container /bin/sh -c 'koha-shell $$KOHA_INSTANCE -c "zebraidx -c /etc/koha/sites/$$KOHA_INSTANCE/zebra-biblios.cfg commit"' 2> /dev/null
	@sudo docker run --net=dockercompose_backend --rm -v dockercompose_koha_state:/data -v $(shell pwd)/out:/out busybox cp /out/catalogue.mrc /data/
	@echo "-- Importing to Koha with bulkmarcimport"
	@sudo docker exec koha_container koha-shell -c "/usr/share/koha/bin/migration_tools/bulkmarcimport.pl -b -file /var/lib/state/catalogue.mrc -commit 1000" $(KOHA_INSTANCE)
	@echo "-- Starting Zebra indexer"
	@sudo docker exec koha_container koha-start-zebra $$KOHA_INSTANCE
	@echo "OK Done importing catalogue into Koha\n"
	@touch out/done.migrate_catalogue_to_koha

out/done.convert_catalogue_to_nt: out/done.massage_input_data
	@echo "   Converting catalogue to RDF with migmarc2rdf"
	@$(MIGRATION_RUN_CMD) "cd /usr/src/migmarc2rdf && sed -i s/placeholder.com/$(HOST)/ config/mapping.yaml && ruby marc2rdf.rb -i /out/catalogue.marcxml -h $(HOST) > /out/catalogue.nt" 2> /dev/null
	@echo "OK Done initial convertion of catalogue to RDF\n"
	@touch out/done.convert_catalogue_to_nt

VIRTUOSO=http://192.168.50.12:8890
out/done.import_into_fuseki: out/done.convert_catalogue_to_nt
	@echo "   Importing RDF into LSEXT (Fuseki)"
	@echo "-- Stopping and removing temprorary virtuoso triplestore (if present)"
	-@sudo docker stop virtuoso > /dev/null
	-@sudo docker rm virtuoso > /dev/null
	@echo "-- Starting temporary virtuoso triplestore"
	@sudo docker run -d --net=dockercompose_backend --name=virtuoso -p 8890:8890 digibib/virtuoso > /dev/null
	@echo "-- waiting until virtuoso is ready"
	@until $$(curl --output /dev/null --silent --head --fail $(VIRTUOSO)/sparql); do printf '.' ; sleep 2 ; done ; printf "\n"
	@echo "-- Splitting catalogue.nt into chunks"
	@split --lines 250000 out/catalogue.nt out/dumps
	@echo "-- Importing chunks into virtuoso"
	@for f in out/dumps* ; do \
	curl -s -w "   %{time_total}s\n" -X POST --digest -u dba:dba -H Content-Type:application/n-triples -T $$f \
		-G $(VIRTUOSO)/sparql-graph-crud-auth --data-urlencode graph=http://deichman.no/migration ; sleep 3 ; done
	@echo "-- Running SPARQL queries to massage resources (create works & relationships)"
	@ls sparql/*.sparql | xargs sed -e s/__HOST__/$(HOST)/g | sudo docker exec -i virtuoso /virtuoso/bin/isql -U dba -P dba > /dev/null # TODO minimize output from isql
	@echo "-- Constructing the complete RDF resources to be migrated (resources.nt)"
	@$(MIGRATION_RUN_CMD) 'construct > /out/resources.nt'
	@echo "-- Splitting resources.nt into chunks"
	@split --additional-suffix=.nt --lines 250000 out/resources.nt out/complete
	@echo "-- Clearing default graph in Fuseki"
	@$(MIGRATION_RUN_CMD) 'curl -s -X POST --data-urlencode update="clear default" http://fuseki:3030/ds/update' > /dev/null
	@echo "-- Import chunks into Fuseki"
	@$(MIGRATION_RUN_CMD) 'for f in /out/complete* ; do curl -s -w "%{time_total}s\n" -X POST fuseki:3030/ds/upload -F grap=default -F import.nt=@$$f ; done' > /dev/null
	@#echo "-- Stopping and removing temprorary virtuoso triplestore"
	@#sudo docker stop virtuoso
	@#sudo docker rm virtuoso
	@touch out/done.import_into_fuseki
	@echo "OK Completed RDF import to Fuseki\n"

out/done.koha_fuseki_sync: out/done.migrate_catalogue_to_koha out/done.import_into_fuseki
	@echo "   Syncing Koha and Fuseki"
	@echo "-- Extracting biblionumber and bibliofil-tittelnumbers from Koha"
	@$(MIGRATION_RUN_CMD) '$(MYSQL_CMD) -N -B -e "SELECT biblionumber, ExtractValue(marcxml, '\''//controlfield[@tag=\"001\"]'\'') AS '\''bibliofilPublicationId'\'' FROM biblioitems;"' > out/sync_ids.tsv
	@echo "-- Generating SPARQL query to sync IDs, and send it to Fuseki"
	@$(MIGRATION_RUN_CMD) "syncids -h=$(HOST) -i=/out/sync_ids.tsv > /out/ids.sparql"
	@$(MIGRATION_RUN_CMD) 'curl -s -w "   %{time_total}s\n" -X POST -H "Content-Type: application/sparql-update" -d @/out/ids.sparql fuseki:3030/ds/update'
	@echo "-- Synchronizing holdingbranches from Koha to Fuseki"
	@$(MIGRATION_RUN_CMD) '$(MYSQL_CMD) -N -B -e "SELECT biblioitemnumber,GROUP_CONCAT(DISTINCT holdingbranch) FROM items GROUP BY biblioitemnumber ;" > /out/holdingbranches.tsv'
	@$(MIGRATION_RUN_CMD) "syncbranches -h=$(HOST) -i=/out/holdingbranches.tsv > /out/holdingbranches.sparql"
	@$(MIGRATION_RUN_CMD) 'curl -s -w "   %{time_total}s\n" -X POST -H "Content-Type: application/sparql-update" -d @/out/holdingbranches.sparql fuseki:3030/ds/update'
	@echo "-- Inserting image links"
	@cp config_data/images.csv.gz out/images.csv.gz
	@$(MIGRATION_RUN_CMD) "syncimages -h=$(HOST) -i=/out/images.csv.gz > /out/images.sparql"
	@$(MIGRATION_RUN_CMD) 'curl -s -w "   %{time_total}s\n" -X POST -H "Content-Type: application/sparql-update" -d @/out/images.sparql fuseki:3030/ds/update'
	@echo "OK Done syncing.\n"
	@touch out/done.koha_fuseki_sync
	@echo "-- Starting resurce indexing into Elasticsearch..."
	@$(MIGRATION_RUN_CMD) 'curl -s -X POST services:8005/search/clear_index'
	@$(MIGRATION_RUN_CMD) 'curl -s -X POST services:8005/search/work/reindex_all'
	@$(MIGRATION_RUN_CMD) 'curl -s -X POST services:8005/search/person/reindex_all'
	@$(MIGRATION_RUN_CMD) 'curl -s -X POST services:8005/search/place/reindex_all'
	@$(MIGRATION_RUN_CMD) 'curl -s -X POST services:8005/search/genre/reindex_all'
	@$(MIGRATION_RUN_CMD) 'curl -s -X POST services:8005/search/subject/reindex_all'
	@echo "   Migration is complete. Goodbye!"
	@echo "!! TODO stop running virtuoso container (left up for debugging)"
