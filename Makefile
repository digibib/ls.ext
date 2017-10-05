.PHONY: all provision test clean help

ifndef LSDEVMODE
LSDEVMODE=dev
endif

LSEXTPATH=$(shell pwd)
HOST ?= localhost
DOCKER_GW=172.19.0.1

DOCKER_COMPOSE_INIT=. docker-compose/docker-compose.env && cd docker-compose
DOCKER_COMPOSE=docker-compose -f common.yml -f ${LSDEVMODE}.yml
DOCKER_COMPOSE_FULL=$(DOCKER_COMPOSE_INIT) && $(DOCKER_COMPOSE)

all: provision                       					# Provision the system

help:                                                 	## Show this help.
	@fgrep -h "##" $(MAKEFILE_LIST) | fgrep -v fgrep | sed -e 's/\\$$//' | sed -e 's/##//'

docker_compose_up:
	$(DOCKER_COMPOSE_FULL) up -d

shell_provision_ship:
	./provision.sh $(LSDEVMODE) $(LSEXTPATH) $(HOST)

provision:  shell_provision_ship wait_until_ready   	## Full provision

ifndef GITREF
export GITREF=$(shell git rev-parse HEAD)
endif

wait_until_ready:					## Checks if koha is up and running
	sudo docker exec -t xkoha ./wait_until_ready.py

ifdef TESTPROFILE
CUKE_PROFILE_ARG=--profile $(TESTPROFILE)
endif

ifeq ($(shell uname -s), Darwin)
XHOST_PATH=/opt/X11/bin/
endif

ifdef TESTBROWSER
BROWSER_ARG=-e BROWSER=$(TESTBROWSER)
XHOST_ADD=$(XHOST_PATH)xhost +
XHOST_REMOVE=$(XHOST_PATH)xhost -
DISPLAY_ARG=-e DISPLAY=$(DOCKER_GW):0
endif

ifdef FEATURE
CUKE_ARGS=-n \"$(FEATURE)\"
endif

test: test_patron_client test_catalinker cuke_test	## Run unit, module and cucumber tests.

ifdef CUKE_PROFILE_ARG
CUKE_PROFILE=$(CUKE_PROFILE_ARG)
else
CUKE_PROFILE=--profile default
endif

ifdef FAIL_FAST
FAIL_FAST_ARG=-e FAIL_FAST=1
endif

ifeq ($(LSDEVMODE),ci)
CACHE_ARG=--no-cache
endif

rebuild=$(DOCKER_COMPOSE_INIT) && $(DOCKER_COMPOSE) stop $(1) || true &&\
	  $(DOCKER_COMPOSE) rm -f $(1) || true &&\
	  $(DOCKER_COMPOSE) build $(CACHE_ARG) $(1) &&\
	  $(DOCKER_COMPOSE) up --force-recreate --no-deps -d $(1)

rebuild_services: docker_cleanup			## Force rebuilds services
	@echo "======= FORCE RECREATING SERVICES ======\n"
ifeq ($(LSDEVMODE),ci)
	$(DOCKER_COMPOSE_INIT) &&\
	$(DOCKER_COMPOSE) stop build_services || true &&\
	$(DOCKER_COMPOSE) rm -f build_services || true &&\
	docker volume rm dockercompose_services_build || true &&\
	$(DOCKER_COMPOSE) build build_services &&\
	$(DOCKER_COMPOSE) run build_services
	docker run --rm \
		   -v dockercompose_services_build:/from \
		   -v $(LSEXTPATH):/to \
			alpine ash -c 'cp /from/build/libs/services-1.0-SNAPSHOT-standalone.jar /to/'
	mkdir -p redef/services/build/libs
	cp services-1.0-SNAPSHOT-standalone.jar redef/services/build/libs/
else
	$(DOCKER_COMPOSE_INIT) &&\
	$(DOCKER_COMPOSE) stop build_services || true &&\
	$(DOCKER_COMPOSE) rm -f build_services || true &&\
	$(DOCKER_COMPOSE) build build_services &&\
	$(DOCKER_COMPOSE) run build_services
endif
	$(call rebuild,services)

rebuild_catalinker:					## Force rebuilds catalinker
	@echo "======= FORCE RECREATING CATALINKER ======\n"
	$(call rebuild,catalinker)

rebuild_patron_client:					## Force rebuilds patron-client
	@echo "======= FORCE RECREATING PATRON-CLIENT ======\n"
ifeq ($(LSDEVMODE),ci)
	$(DOCKER_COMPOSE_INIT) &&\
	$(DOCKER_COMPOSE) stop build_patron_client || true &&\
	$(DOCKER_COMPOSE) rm -f build_patron_client || true &&\
	$(DOCKER_COMPOSE) build --no-cache build_patron_client &&\
	$(DOCKER_COMPOSE) run build_patron_client
endif
	$(call rebuild,patron_client)

rebuild_cuke_tests:					## Force rebuilds cuke_tests
	@echo "======= FORCE RECREATING CUKE_TESTS ======\n"
	$(call rebuild,cuke_tests)

cuke_test:						## Run Cucumber tests
	@$(XHOST_ADD)
	rm -rf $(LSEXTPATH)/test/report/*.* && \
	  $(DOCKER_COMPOSE_FULL) run --rm $(DISPLAY_ARG) $(BROWSER_ARG) $(FAIL_FAST_ARG) cuke_tests \
		bash -c "ruby /tests/sanity-check.rb && \
		cucumber --profile rerun `if [ -n \"$(CUKE_PROFILE)\" ]; then echo $(CUKE_PROFILE); else echo --profile default; fi` $(CUKE_ARGS) || \
		cucumber @report/rerun.txt `if [ -n \"$(CUKE_PROFILE)\" ]; then echo $(CUKE_PROFILE); else echo --profile default; fi` $(CUKE_ARGS)"
	@$(XHOST_REMOVE)

test_one:						## Run 'utlaan_via_superbruker'.
	@$(XHOST_ADD)
	$(DOCKER_COMPOSE_FULL) run --rm $(BROWSER_ARG) $(DISPLAY_ARG) cuke_tests cucumber $(CUKE_PROFILE_ARG) -n "Superbruker l.ner ut bok til Knut"
	@$(XHOST_REMOVE)

list_unused_steps:					## List unused cucumber steps
	$(DOCKER_COMPOSE_FULL) run --rm cuke_tests cucumber --tags=~@ignore --tags=~@migration -d -f Unused

rebuild_zebra:						## Rebuild Zebra index in Koha
	sudo docker exec xkoha koha-rebuild-zebra -full -v -b name

clean_report:						## Clean the cucumber report directory
	rm test/report/*.* || true

test_redef: test_patron_client test_catalinker cuke_redef	## Test only Redef (excluding services — this is tested during build)

cuke_redef:						## Run redef cucumber tests
	@$(XHOST_ADD)
	rm -rf $(LSEXTPATH)/test/report/*.* && \
	  $(DOCKER_COMPOSE_FULL) run --rm $(DISPLAY_ARG) $(BROWSER_ARG) cuke_tests \
		bash -c "ruby /tests/sanity-check.rb && cucumber --profile rerun \
		`if [ -n \"$(CUKE_PROFILE_ARG)\" ]; then echo $(CUKE_PROFILE_ARG); else echo --profile default; fi` --tags @redef $(CUKE_ARGS) || cucumber @report/rerun.txt \
		`if [ -n \"$(CUKE_PROFILE_ARG)\" ]; then echo $(CUKE_PROFILE_ARG); else echo --profile default; fi` --tags @redef $(CUKE_ARGS)"
	@$(XHOST_REMOVE)

test_patron_client:					## Run unit and module-tests of patron-client
	cd $(LSEXTPATH)/redef/patron-client && make test

test_catalinker:					## Run unit and module-tests for catalinker
	cd $(LSEXTPATH)/redef/catalinker && make test

login: 							## Login to docker, needs EMAIL, PASSWORD, USER env variables
	sudo docker login --email=$(EMAIL) --username=$(USER) --password=$(PASSWORD)

TAG = "$(shell git rev-parse HEAD)"
push:							## Push services,catalinker & patron-client containers to dockerhub
	cd $(LSEXTPATH)/redef/patron-client && make push TAG=$(TAG)
	cd $(LSEXTPATH)/redef/services && make push TAG=$(TAG)
	cd $(LSEXTPATH)/redef/catalinker && make push TAG=$(TAG)

docker_cleanup:						## Clean up unused docker containers and images
	@echo "cleaning up unused containers, images and volumes"
	#sudo docker rm $$(sudo docker ps -aq -f status=exited) 2> /dev/null || true
	sudo docker rmi $$(sudo docker images -aq -f dangling=true) 2> /dev/null || true
	sudo docker volume rm $$(sudo docker volume ls -q -f=dangling=true) 2> /dev/null || true

# Index commands (elasticsearch)

INDEXES=publication work place genre subject serial compositionType event instrument workSeries corporation person
indexcounts:						## Count number of documents in each index
	@for index in $(INDEXES); do $(CMD) -c "sudo docker exec elasticsearch curl -s 'localhost:9200/search/$$index/_count'" | grep -oP "(?<=count\":)(\d+)" | xargs echo "$$index: " ; done

reindex_all:						## Reindex all resources
	sudo docker exec services curl -s -XPOST 'localhost:8005/search/reindex_all'

clear_indexes_and_reindex_all:				## Re-create index-mappings and reindex all resources
	sudo docker exec services curl -s -XPOST 'localhost:8005/search/clear_index'
	sudo docker exec services curl -s -XPOST 'localhost:8005/search/reindex_all'
