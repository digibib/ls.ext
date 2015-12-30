.PHONY: all test clean help

ifdef LSDEVMODE
SHIP=$(LSDEVMODE)-ship
else
SHIP=vm-ship
endif

all: cycle_ship test                       ## Run tests after (re)loading and (re)provisioning vagrant boxes.

cycle_ship: halt_ship up_ship shell_provision_ship clean_services provision_ship

help:                                                 ## Show this help.
	@fgrep -h "##" $(MAKEFILE_LIST) | fgrep -v fgrep | sed -e 's/\\$$//' | sed -e 's/##//'

reload: halt up                                       ## Reload vagrant boxes.

# halt + up is like a reload - except it should also work if there is no machine yet

halt: halt_ship                 ## Halt boxes.

reload_ship: halt_ship up_ship                        ##

halt_ship:                                            ##
	vagrant halt $(SHIP)

up: up_ship 			                      ## Start boxes.

up_ship:                                              ##
	vagrant up $(SHIP)

full_provision: full_provision_ship                    ## Full reprovision of boxes

shell_provision_ship:                                 ## Run only shell provisioners
	vagrant provision $(SHIP) --provision-with shell

shell_provision: shell_provision_ship                 ## Run only shell provisioners

full_provision_ship:                                  ## Run full provisioning, including salt-install
	vagrant provision $(SHIP)

provision:  provision_ship                            ## Quick re-provision of boxes (only salt states)

provision_ship: provision_ship_highstate wait_until_ready ## Provision ship and wait for koha to be ready.

ifdef GITREF
PILLAR = "pillar={\"GITREF\": \"$(GITREF)\"}"
endif
provision_ship_highstate:                             ## Run state.highstate on $(SHIP)
	vagrant ssh $(SHIP) -c 'sudo salt-call --retcode-passthrough --local state.highstate $(PILLAR)'

wait_until_ready:                                     ## Checks if koha is up and running
	vagrant ssh $(SHIP) -c 'sudo docker exec -t koha_container ./wait_until_ready.py'

ifdef TESTPROFILE
CUKE_PROFILE_ARG=--profile $(TESTPROFILE)
endif

ifdef TESTBROWSER
BROWSER_ARG=BROWSER=$(TESTBROWSER)
endif

ifdef FEATURE
CUKE_ARGS=-n \"$(FEATURE)\"
endif

test: test_patron_client test_catalinker cuke_test     ## Run unit and cucumber tests.

ifdef CUKE_PROFILE_ARG
CUKE_PROFILE=$(CUKE_PROFILE_ARG)
else
CUKE_PROFILE=--profile default
endif

cuke_test:
	@vagrant ssh dev-ship -c "rm -rf /vagrant/test/report/*.* && \
	  sudo docker run --rm -it -e DISPLAY=172.17.0.1:0 --net=host\
       -v $$(which docker):/usr/bin/docker -v /var/run/docker.sock:/var/run/docker.sock -v /vagrant/pillar:/srv/pillar -v /vagrant/test:/tests cuke_tests \
		bash -c '$(BROWSER_ARG) cucumber --profile rerun $(CUKE_PROFILE) $(CUKE_ARGS) || $(BROWSER_ARG) cucumber @report/rerun.txt $(CUKE_PROFILE) $(CUKE_ARGS)'"

test_one:                                              ## Run 'utlaan_via_adminbruker'.
	vagrant ssh dev-ship -c 'sudo docker run --rm -t -v $$(which docker):/usr/bin/docker -v /var/run/docker.sock:/var/run/docker.sock -v /vagrant/pillar:/srv/pillar -v /vagrant/test:/tests cuke_tests $(BROWSER_ARG) cucumber $(CUKE_PROFILE_ARG) -n "Adminbruker l.ner ut bok til Knut"'

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

clean: clean_report                                    ## Destroy boxes (except $(SHIP) and vm-devops).

clean_report:                                          ## Clean cucumber reports.
	rm -rf test/report || true

clean_ship:                                            ## Destroy $(SHIP) box. Prompts for ok.
	vagrant destroy $(SHIP)

dump_ship:                                             ## DEV: Dump database koha_name to koha_name_dump.sql (standard admin.sls only).
	vagrant ssh $(SHIP) -c 'sudo apt-get install mysql-client && sudo mysqldump --user admin --password=secret --host 192.168.50.12 --port 3306 --databases koha_name > /vagrant/koha_name_dump.sql'

login_ship:                                            ## DEV: Login to database from vm-ext (standard admin.sls only)
	vagrant ssh $(SHIP) -c 'sudo mysql --user admin --password=secret --host 192.168.50.12 --port 3306'

nsenter_koha:
	vagrant ssh $(SHIP) -c 'sudo docker exec -it koha_container /bin/bash'

mysql_client:
	vagrant ssh $(SHIP) -c 'sudo apt-get install mysql-client && sudo mysql --user MYadmin --password=MYsecret --host 192.168.50.12 --port 3306'

# Commands for redef build & dev

test_redef: test_patron_client test_services test_catalinker cuke_redef

cuke_redef:
	@vagrant ssh dev-ship -c "rm -rf /vagrant/test/report/*.* && \
	  sudo docker run --rm -t -v $$(which docker):/usr/bin/docker -v /var/run/docker.sock:/var/run/docker.sock -v /vagrant/pillar:/srv/pillar -v /vagrant/test:/tests cuke_tests \
		bash -c '$(BROWSER_ARG) cucumber --profile rerun $(CUKE_PROFILE) --tags @redef $(CUKE_ARGS) || $(BROWSER_ARG) cucumber @report/rerun.txt $(CUKE_PROFILE) --tags @redef $(CUKE_ARGS)'"

test_patron_client:
	vagrant ssh $(SHIP) -c 'cd /vagrant/redef/patron-client && make test'

test_services:
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

docker_cleanup:
	@echo "cleaning up unused containers and images"
	@vagrant ssh $(SHIP) -c 'sudo /vagrant/redef/docker_cleanup.sh'
