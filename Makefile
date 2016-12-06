.PHONY: all test clean help

ifdef LSDEVMODE
SHIP=$(LSDEVMODE)-ship
else
SHIP=vm-ship
LSDEVMODE=dev
endif

ifdef NOVAGRANT
CMD=bash
LSEXTPATH=$(shell pwd)
NOVAGRANT=true
HOST ?= localhost
DOCKER_GW=172.19.0.1
else
CMD=vagrant ssh $(SHIP)
LSEXTPATH=/vagrant
HOST ?= 192.168.50.1
DOCKER_GW=$(HOST)
NOVAGRANT=false
endif

ifndef DOCKER_COMPOSE
DOCKER_COMPOSE=source docker-compose.env && docker-compose -f common.yml -f dev-common.yml -f ${LSDEVMODE}.yml
endif

all: cycle_ship test                       		## Run tests after (re)loading and (re)provisioning environment.

cycle_ship: halt_ship up_ship provision

help:                                                 ## Show this help.
	@fgrep -h "##" $(MAKEFILE_LIST) | fgrep -v fgrep | sed -e 's/\\$$//' | sed -e 's/##//'

reload: halt up                                       ## Reload vagrant boxes.

# halt + up is like a reload - except it should also work if there is no machine yet

halt: halt_ship						## Halt boxes.

reload_ship: halt_ship up_ship                        ##

halt_ship:
	@$(NOVAGRANT) || vagrant halt $(SHIP)
	@$(NOVAGRANT) && sudo $(CMD) -c "cd $(LSEXTPATH)/docker-compose && ${DOCKER_COMPOSE} down" || true

up: up_ship 						## Start box.

up_ship:                                              ##
	@$(NOVAGRANT) || vagrant up $(SHIP)
	@$(NOVAGRANT) && sudo $(CMD) -c "cd $(LSEXTPATH)/docker-compose && ${DOCKER_COMPOSE} up -d" || true

shell_provision_ship:					## Run ONLY shell provisioners
	@$(NOVAGRANT) || vagrant provision $(SHIP) --provision-with shell
	-@$(NOVAGRANT) && ./provision.sh $(LSDEVMODE) $(LSEXTPATH) $(HOST)

provision:  shell_provision_ship wait_until_ready   	## Full provision

ifndef GITREF
export GITREF=$(shell git rev-parse HEAD)
endif

wait_until_ready:					## Checks if koha is up and running
	$(CMD) -c 'sudo docker exec -t xkoha ./wait_until_ready.py'

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

test: test_patron_client test_catalinker cuke_test	## Run unit and cucumber tests.

ifdef CUKE_PROFILE_ARG
CUKE_PROFILE=$(CUKE_PROFILE_ARG)
else
CUKE_PROFILE=--profile default
endif

ifdef FAIL_FAST
FAIL_FAST_ARG=-e FAIL_FAST=1
endif

rebuild=$(CMD) -c "cd $(LSEXTPATH)/docker-compose &&\
	  ${DOCKER_COMPOSE} stop $(1) || true &&\
	  ${DOCKER_COMPOSE} rm -f $(1) || true &&\
	  ${DOCKER_COMPOSE} build $(1) &&\
	  ${DOCKER_COMPOSE} up --force-recreate --no-deps -d $(1)"

rebuild_services: docker_cleanup			## Force rebuilds services
	@echo "======= FORCE RECREATING SERVICES ======\n"
	$(CMD) -c "cd $(LSEXTPATH)/docker-compose &&\
	  ${DOCKER_COMPOSE} stop build_services || true &&\
	  ${DOCKER_COMPOSE} rm -f build_services || true &&\
	  ${DOCKER_COMPOSE} build build_services &&\
	  ${DOCKER_COMPOSE} run build_services"
	$(call rebuild,services)

rebuild_catalinker:					## Force rebuilds catalinker
	@echo "======= FORCE RECREATING CATALINKER ======\n"
	$(call rebuild,catalinker)

rebuild_patron_client:					## Force rebuilds patron-client
	@echo "======= FORCE RECREATING PATRON-CLIENT ======\n"
ifeq ($(LSDEVMODE),build)
	$(CMD) -c "cd $(LSEXTPATH)/docker-compose &&\
	  ${DOCKER_COMPOSE} stop build_patron_client || true &&\
	  ${DOCKER_COMPOSE} rm -f build_patron_client || true &&\
	  ${DOCKER_COMPOSE} build build_patron_client &&\
	  ${DOCKER_COMPOSE} run build_patron_client"
endif
	$(call rebuild,patron_client)

rebuild_overview:					## Force rebuilds overview
	@echo "======= FORCE RECREATING OVERVIEW ======\n"
	$(call rebuild,overview)

graph:                              ## Redraw graph of components (replaces docker-compose/dev-stack.png)
	$(CMD) -c "cd $(LSEXTPATH)/docker-compose &&\
	sudo docker run --rm -v $(LSEXTPATH)/docker-compose:/tmp digibib/docker-compose-dot:21af6b4fd714903cebd3d4658ad35da4d0db0051 ./app /tmp/docker-compose.yml 2> /dev/null 1> docker-compose.dot && \
	dot docker-compose.dot -Tpng > dev-stack.png"

cuke_test:						## Run Cucumber tests
	@$(XHOST_ADD)
	$(CMD) -c "rm -rf $(LSEXTPATH)/test/report/*.* && \
	  cd $(LSEXTPATH)/docker-compose && ${DOCKER_COMPOSE} run --rm $(DISPLAY_ARG) $(BROWSER_ARG) $(FAIL_FAST_ARG) cuke_tests \
		bash -c 'ruby /tests/sanity-check.rb && \
		cucumber --profile rerun `if [ -n \"$(CUKE_PROFILE)\" ]; then echo $(CUKE_PROFILE); else echo --profile default; fi` $(CUKE_ARGS) || \
		cucumber @report/rerun.txt `if [ -n \"$(CUKE_PROFILE)\" ]; then echo $(CUKE_PROFILE); else echo --profile default; fi` $(CUKE_ARGS)'"
	@$(XHOST_REMOVE)

test_one:						## Run 'utlaan_via_adminbruker'.
	@$(XHOST_ADD)
	$(CMD) -c 'cd $(LSEXTPATH)/docker-compose && ${DOCKER_COMPOSE} run --rm $(BROWSER_ARG) $(DISPLAY_ARG) cuke_tests cucumber $(CUKE_PROFILE_ARG) -n "Adminbruker l.ner ut bok til Knut"'
	@$(XHOST_REMOVE)

stop_koha:
	@echo "======= STOPPING KOHA CONTAINER ======\n"
	$(CMD) -c 'sudo docker stop xkoha'

delete_koha: stop_koha
	$(CMD) -c 'sudo docker rm xkoha'

rebuild_zebra:
	$(CMD) -c 'sudo docker exec xkoha koha-rebuild-zebra -full -v -b name'

stop_ship:
	@echo "======= STOPPING KOHA CONTAINER ======\n"
	$(CMD) -c '(sudo docker stop xkoha || true) && sudo docker stop koha_mysql'

delete_ship: stop_ship
	$(CMD) -c '(sudo docker rm xkoha || true) && sudo docker rm -v koha_mysql'

delete_db: stop_ship
	$(CMD) -c 'sudo docker rm koha_mysql_data'

wipe_db: delete_ship
	$(CMD) -c 'sudo docker rm -v koha_mysql_data'

clean_report:
	rm test/report/*.* || true

clean: 					## Destroy $(SHIP) box. Prompts for ok.
	@$(NOVAGRANT) || vagrant destroy -f $(SHIP)

dump_ship:						## DEV: Dump database koha_name to koha_name_dump.sql (standard admin.sls only).
	$(CMD) -c "sudo apt-get install mysql-client && sudo mysqldump --user admin --password=secret --host $(HOST) --port 3306 --databases koha_name > $(LSEXTPATH)/koha_name_dump.sql"

login_ship:						## DEV: Login to database from vm-ext (standard admin.sls only)
	$(CMD) -c "sudo mysql --user admin --password=secret --host $(LXHOST) --port 3306"

mysql_client:
	$(CMD) -c "sudo apt-get install mysql-client && sudo mysql --user MYadmin --password=MYsecret --host $(HOST) --port 3306"

# Commands for redef build & dev

test_redef: test_patron_client test_catalinker cuke_redef  ## Test only Redef (excluding services — this is tested during build)

cuke_redef:						## Run only redef cucumber tests
	@$(XHOST_ADD)
	$(CMD) -c "rm -rf $(LSEXTPATH)/test/report/*.* && \
	  cd $(LSEXTPATH)/docker-compose && ${DOCKER_COMPOSE} run --rm $(DISPLAY_ARG) $(BROWSER_ARG) cuke_tests \
		bash -c 'ruby /tests/sanity-check.rb && cucumber --profile rerun \
		`if [ -n \"$(CUKE_PROFILE_ARG)\" ]; then echo $(CUKE_PROFILE_ARG); else echo --profile default; fi` --tags @redef $(CUKE_ARGS) || cucumber @report/rerun.txt \
		`if [ -n \"$(CUKE_PROFILE_ARG)\" ]; then echo $(CUKE_PROFILE_ARG); else echo --profile default; fi` --tags @redef $(CUKE_ARGS)'"
	@$(XHOST_REMOVE)

test_patron_client:					## Run unit and module tests of patron-client
	$(CMD) -c 'cd $(LSEXTPATH)/redef/patron-client && make test'

test_catalinker:
	$(CMD) -c 'cd $(LSEXTPATH)/redef/catalinker && make test'

login: # needs EMAIL, PASSWORD, USER
	@ $(CMD) -c 'sudo docker login --email=$(EMAIL) --username=$(USER) --password=$(PASSWORD)'

TAG = "$(shell git rev-parse HEAD)"
push:
	$(CMD) -c 'cd $(LSEXTPATH)/redef/patron-client && make push TAG=$(TAG)'
	$(CMD) -c 'cd $(LSEXTPATH)/redef/services && make push TAG=$(TAG)'
	$(CMD) -c 'cd $(LSEXTPATH)/redef/catalinker && make push TAG=$(TAG)'

docker_cleanup:						## Clean up unused docker containers and images
	@echo "cleaning up unused containers, images and volumes"
	#$(CMD) -c 'sudo docker rm $$(sudo docker ps -aq -f status=exited) 2> /dev/null || true'
	$(CMD) -c 'sudo docker rmi $$(sudo docker images -aq -f dangling=true) 2> /dev/null || true'
	$(CMD) -c 'sudo docker volume rm $$(sudo docker volume ls -q -f=dangling=true) 2> /dev/null || true'

DOCKER_COMPOSE_DOT_IMAGE ?= 21af6b4fd714903cebd3d4658ad35da4d0db0051
create_dev_stack_image:
	@echo "creating dot file for docker-compose templates"
	$(CMD) -c "sudo docker run --rm -v $(LSEXTPATH)/docker-compose:/tmp \
		-t digibib/docker-compose-dot:$(DOCKER_COMPOSE_DOT_IMAGE) \
		./app /tmp/docker-compose-template-dev.yml | \
		dot -Tpng > $(LSEXTPATH)/docker-compose/dev-stack.png"

prepare_prod: # provision for prod, assuming docker & docker-compose installed
	@echo "Preparing docker-compose template"
	@bash -c  "cd docker-compose && \
		source docker-compose.env && \
		source secrets.env && \
		LSEXTPATH=$$(pwd) && \
		envsubst < docker-compose-template-prod.yml > docker-compose.yml"
	@echo "Fetching containers (using GITREF=$(GITREF))"
	@docker-compose -f docker-compose/docker-compose.yml pull