.PHONY: all test clean help

ifdef LSDEVMODE
SHIP=$(LSDEVMODE)-ship
else
SHIP=vm-ship
endif

all: cycle_ship test                       		## Run tests after (re)loading and (re)provisioning vagrant box.

cycle_ship: halt_ship up_ship provision

help:                                                 ## Show this help.
	@fgrep -h "##" $(MAKEFILE_LIST) | fgrep -v fgrep | sed -e 's/\\$$//' | sed -e 's/##//'

reload: halt up                                       ## Reload vagrant boxes.

# halt + up is like a reload - except it should also work if there is no machine yet

halt: halt_ship						## Halt boxes.

reload_ship: halt_ship up_ship                        ##

halt_ship:                                            ##
	vagrant halt $(SHIP)

up: up_ship 						## Start box.

up_ship:                                              ##
	vagrant up $(SHIP)

shell_provision_ship:					## Run ONLY shell provisioners
	vagrant provision $(SHIP) --provision-with shell

provision:  shell_provision_ship provision_ship   	## Full provision

provision_ship: provision_ship_highstate wait_until_ready ## Provision ship and wait for koha to be ready.

ifdef GITREF
PILLAR = "pillar={\"GITREF\": \"$(GITREF)\"}"
else
export GITREF=$(shell git rev-parse HEAD)
endif

provision_ship_highstate:				## Run state.highstate on $(SHIP)
	vagrant ssh $(SHIP) -c 'sudo salt-call --retcode-passthrough --local state.highstate $(PILLAR)'

wait_until_ready:					## Checks if koha is up and running
	vagrant ssh $(SHIP) -c 'sudo docker exec -t koha_container ./wait_until_ready.py'

ifdef TESTPROFILE
CUKE_PROFILE_ARG=--profile $(TESTPROFILE)
endif

DEVELOPER_IP=192.168.50.1
ifeq ($(shell uname -s), Darwin)
XHOST_PATH=/opt/X11/bin/
endif

ifdef TESTBROWSER
BROWSER_ARG=-e BROWSER=$(TESTBROWSER)
XHOST_ADD=$(XHOST_PATH)xhost +
XHOST_REMOVE=$(XHOST_PATH)xhost -
DISPLAY_ARG=-e DISPLAY=$(DEVELOPER_IP):0
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

rebuild_services:					## Force rebuilds services
	@vagrant ssh $(SHIP) -c "cd /vagrant/redef/services && ./gradlew --no-daemon dockerBuildImage  && \
	cd /vagrant/docker-compose && sudo docker-compose build services && sudo docker-compose up -d --force-recreate services"

rebuild_catalinker:					## Force rebuilds catalinker
	@echo "======= FORCE RECREATING CATALINKER ======\n"
	vagrant ssh $(SHIP) -c "cd /vagrant/docker-compose && sudo docker-compose build catalinker && sudo docker-compose up --force-recreate -d catalinker"

restart_catalinker:					## Restarts catalinker
	@vagrant ssh $(SHIP) -c "cd /vagrant/docker-compose && sudo docker-compose restart catalinker"

rebuild_patron_client:					## Force rebuilds patron-client
	@echo "======= FORCE RECREATING PATRON-CLIENT ======\n"
	vagrant ssh $(SHIP) -c "cd /vagrant/docker-compose && sudo docker-compose build patron-client && sudo docker-compose up --force-recreate -d patron-client"

rebuild_overview:					## Force rebuilds overview
	@echo "======= FORCE RECREATING OVERVIEW ======\n"
	vagrant ssh $(SHIP) -c "cd /vagrant/docker-compose && sudo docker-compose build overview && sudo docker-compose up --force-recreate -d overview"

cuke_test:						## Run Cucumber tests
	@$(XHOST_ADD)
	vagrant ssh $(SHIP) -c "rm -rf /vagrant/test/report/*.* && \
	  cd /vagrant/docker-compose && sudo docker-compose run $(DISPLAY_ARG) $(BROWSER_ARG) $(FAIL_FAST_ARG) cuke_tests \
		bash -c 'ruby /tests/sanity-check.rb && \
		cucumber --profile rerun `if [ -n \"$(CUKE_PROFILE)\" ]; then echo $(CUKE_PROFILE); else echo --profile default; fi` $(CUKE_ARGS) || \
		cucumber @report/rerun.txt `if [ -n \"$(CUKE_PROFILE)\" ]; then echo $(CUKE_PROFILE); else echo --profile default; fi` $(CUKE_ARGS)'"
	@$(XHOST_REMOVE)

test_one:						## Run 'utlaan_via_adminbruker'.
	@$(XHOST_ADD)
	@vagrant ssh $(SHIP) -c 'cd /vagrant/docker-compose && sudo docker-compose run $(BROWSER_ARG) $(DISPLAY_ARG) cuke_tests cucumber $(CUKE_PROFILE_ARG) -n "Adminbruker l.ner ut bok til Knut"'
	@$(XHOST_REMOVE)

stop_koha:
	@echo "======= STOPPING KOHA CONTAINER ======\n"
	vagrant ssh $(SHIP) -c 'sudo docker stop koha_container'

delete_koha: stop_koha
	vagrant ssh $(SHIP) -c 'sudo docker rm koha_container'

stop_ship:
	@echo "======= STOPPING KOHA CONTAINER ======\n"
	vagrant ssh $(SHIP) -c '(sudo docker stop koha_container || true) && sudo docker stop koha_mysql_container'

delete_ship: stop_ship
	vagrant ssh $(SHIP) -c '(sudo docker rm koha_container || true) && sudo docker rm -v koha_mysql_container'

delete_db: stop_ship
	vagrant ssh $(SHIP) -c 'sudo docker rm koha_mysql_data'

wipe_db: delete_ship
	vagrant ssh $(SHIP) -c 'sudo docker rm -v koha_mysql_data'

clean: clean_report					## Destroy boxes (except $(SHIP)).

clean_report:						## Clean cucumber reports.
	rm -rf test/report || true

clean_ship:						## Destroy $(SHIP) box. Prompts for ok.
	vagrant destroy -f $(SHIP)

dump_ship:						## DEV: Dump database koha_name to koha_name_dump.sql (standard admin.sls only).
	vagrant ssh $(SHIP) -c 'sudo apt-get install mysql-client && sudo mysqldump --user admin --password=secret --host 192.168.50.12 --port 3306 --databases koha_name > /vagrant/koha_name_dump.sql'

login_ship:						## DEV: Login to database from vm-ext (standard admin.sls only)
	vagrant ssh $(SHIP) -c 'sudo mysql --user admin --password=secret --host 192.168.50.12 --port 3306'

nsenter_koha:
	vagrant ssh $(SHIP) -c 'sudo docker exec -it koha_container /bin/bash'

mysql_client:
	vagrant ssh $(SHIP) -c 'sudo apt-get install mysql-client && sudo mysql --user MYadmin --password=MYsecret --host 192.168.50.12 --port 3306'

# Commands for redef build & dev

test_redef: test_patron_client test_services test_catalinker cuke_redef  ## Test only Redef

cuke_redef:						## Run only redef cucumber tests
	@$(XHOST_ADD)
	@vagrant ssh $(SHIP) -c "rm -rf /vagrant/test/report/*.* && \
	  cd /vagrant/docker-compose && sudo docker-compose run $(DISPLAY_ARG) $(BROWSER_ARG) cuke_tests \
		bash -c 'ruby /tests/sanity-check.rb && cucumber --profile rerun \
		`if [ -n \"$(CUKE_PROFILE_ARG)\" ]; then echo $(CUKE_PROFILE_ARG); else echo --profile default; fi` --tags @redef $(CUKE_ARGS) || cucumber @report/rerun.txt \
		`if [ -n \"$(CUKE_PROFILE_ARG)\" ]; then echo $(CUKE_PROFILE_ARG); else echo --profile default; fi` --tags @redef $(CUKE_ARGS)'"
	@$(XHOST_REMOVE)

test_patron_client:					## Run unit and module tests of patron-client
	vagrant ssh $(SHIP) -c 'cd /vagrant/redef/patron-client && make test'

test_services:						## Run unit and module tests of services
	vagrant ssh $(SHIP) -c 'cd /vagrant/redef/services && make test'

test_catalinker:
	vagrant ssh $(SHIP) -c 'cd /vagrant/redef/catalinker && make test'

run_redef: run_patron_client run_services run_catalinker

run_patron_client:
	vagrant ssh $(SHIP) -c 'cd /vagrant/redef/patron-client && make run-dev'

run_services:
	vagrant ssh $(SHIP) -c 'cd /vagrant/redef/services && make run-dev'

clean_services:
	vagrant ssh $(SHIP) -c 'cd /vagrant/redef/services && make clean'

run_catalinker:
	vagrant ssh $(SHIP) -c 'cd /vagrant/redef/catalinker && make run-dev'

login: # needs EMAIL, PASSWORD, USER
	@ vagrant ssh $(SHIP) -c 'sudo docker login --email=$(EMAIL) --username=$(USER) --password=$(PASSWORD)'

TAG = "$(shell git rev-parse HEAD)"
push:
	vagrant ssh $(SHIP) -c 'cd /vagrant/redef/patron-client && make push TAG=$(TAG)'
	vagrant ssh $(SHIP) -c 'cd /vagrant/redef/services && make push TAG=$(TAG)'
	vagrant ssh $(SHIP) -c 'cd /vagrant/redef/catalinker && make push TAG=$(TAG)'

docker_cleanup:						## Clean up unused docker containers and images
	@echo "cleaning up unused containers and images"
	@vagrant ssh $(SHIP) -c 'sudo /vagrant/redef/docker_cleanup.sh'
