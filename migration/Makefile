
# Variables
# =========

HOSTNAME ?= 192.168.50.12:8005
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

.PHONY: all clean migrate

all: migrate

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
	@echo "-- Truncating tables: zebraqueue, biblio, bibliotiems and items"
	@$(MIGRATION_RUN_CMD) '$(MYSQL_CMD) -e "SET foreign_key_checks=0;TRUNCATE zebraqueue;TRUNCATE TABLE biblioitems;TRUNCATE TABLE biblio;TRUNCATE TABLE items;SET foreign_key_checks=1;"'
	@echo "-- Clearing zebra index"
	-@sudo docker exec koha_container /bin/sh -c 'sudo zebraidx -c /etc/koha/sites/$$KOHA_INSTANCE/zebra-biblios.cfg drop biblios' 2> /dev/null
	-@sudo docker exec koha_container /bin/sh -c 'sudo zebraidx -c /etc/koha/sites/$$KOHA_INSTANCE/zebra-biblios.cfg commit' 2> /dev/null
	@echo "OK Done setting up Koha\n"
	@touch out/done.setup_koha

out/done.migrate_catalogue_to_koha: out/done.setup_koha
	@echo "   Importing catalogue with items into Koha"
	@echo "-- Stopping Zebra indexer"
	@sudo docker exec koha_container koha-stop-zebra $$KOHA_INSTANCE
	@echo "-- Copying catalogue.mrc into Koha container"
	@sudo docker run --net=dockercompose_backend --rm -v dockercompose_koha_state:/data -v $(shell pwd)/out:/out busybox cp /out/catalogue.mrc /data/
	@echo "-- Importing to Koha with bulkmarcimport"
	@sudo docker exec koha_container koha-shell -c "/usr/share/koha/bin/migration_tools/bulkmarcimport.pl -b -file /var/lib/state/catalogue.mrc -commit 1000" $(KOHA_INSTANCE)
	@echo "-- Starting Zebra indexer"
	@sudo docker exec koha_container koha-stop-zebra $$KOHA_INSTANCE
	@echo "OK Done importing catalogue into Koha"
	@touch out/done.migrate_catalogue_to_koha

out/done.convert_catalogue_to_nt: out/done.massage_input_data
	@echo "   Converting catalogue to RDF with migmarc2rdf"
	@$(MIGRATION_RUN_CMD) "cd /usr/src/migmarc2rdf && sed -i s/placeholder.com/$(HOSTNAME)/ config/mapping.yaml && ruby marc2rdf.rb -i /out/catalogue.marcxml -h $(HOSTNAME) > /out/catalogue.nt" 2> /dev/null
	@echo "OK Done initial convertion of catalogue to RDF"
	@echo "!! TODO further processsing (generate works etc)"
	@touch out/done.convert_catalogue_to_nt

migrate: out/done.migrate_catalogue_to_koha out/done.convert_catalogue_to_nt