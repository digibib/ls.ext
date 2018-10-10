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
	$(DOCKER_COMPOSE_FULL) up -d --remove-orphans

shell_provision_ship:
	./provision.sh $(LSDEVMODE) $(LSEXTPATH) $(HOST)

provision:  shell_provision_ship wait_until_ready   	## Full provision

ifndef GITREF
export GITREF=$(shell git rev-parse HEAD)
endif

wait_until_ready:					## Checks if koha is up and running
	sudo docker exec -t xkoha ./wait_until_ready.py

ifeq ($(shell uname -s), Darwin)
XHOST_PATH=/opt/X11/bin/
endif

ifdef TESTBROWSER
BROWSER_ARG=-e BROWSER=$(TESTBROWSER)
XHOST_ADD=$(XHOST_PATH)xhost +
XHOST_REMOVE=$(XHOST_PATH)xhost -
DISPLAY_ARG=-e DISPLAY=$(DOCKER_GW):0
endif

test: test_catalinker	## Run unit and module tests.

ifdef FAIL_FAST
FAIL_FAST_ARG=-e FAIL_FAST=1
endif

ifeq ($(LSDEVMODE),ci)
CACHE_ARG=--no-cache
endif

rebuild=$(DOCKER_COMPOSE_INIT) && $(DOCKER_COMPOSE) stop $(1) || true &&\
	  $(DOCKER_COMPOSE) rm -f $(1) || true &&\
	  $(DOCKER_COMPOSE) build $(CACHE_ARG) $(1)

rebuild_services:  			## Force rebuilds services
	@echo "======= FORCE RECREATING SERVICES ======\n"
	$(call rebuild,services)

rebuild_catalinker:					## Force rebuilds catalinker
	@echo "======= FORCE RECREATING CATALINKER ======\n"
	$(call rebuild,catalinker)

rebuild_zebra:						## Rebuild Zebra index in Koha
	sudo docker exec xkoha koha-rebuild-zebra -full -v -b name

clean_report:						## Clean the cucumber report directory
	rm test/report/*.* || true

test_redef: test_catalinker	## Test only Redef (excluding services — this is tested during build)

test_catalinker:					## Run unit and module-tests for catalinker
	cd $(LSEXTPATH)/redef/catalinker && make test

login: 							## Login to docker, needs PASSWORD, USER env variables
	@docker login --username=$(USER) --password=$(PASSWORD)

TAG = "$(shell git rev-parse HEAD)"
push:							## Push services and catalinker images to dockerhub
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
