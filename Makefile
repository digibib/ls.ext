.PHONY: all test clean help

ifdef LSDEVMODE
SHIP=$(LSDEVMODE)-ship
else
SHIP=vm-ship
endif

all: reload full_provision test                            ## Run tests after (re)loading and (re)provisioning vagrant boxes.

help:                                                 ## Show this help.
	@fgrep -h "##" $(MAKEFILE_LIST) | fgrep -v fgrep | sed -e 's/\\$$//' | sed -e 's/##//'

reload: halt up                                       ## Reload vagrant boxes.

# halt + up is like a reload - except it should also work if there is no machine yet

reload_test: halt_test up_test                        ## Reload vm-test box.

halt: halt_test halt_ship halt_devops                 ## Halt boxes.

reload_devops: halt_devops up_devops                  ##

reload_ship: halt_ship up_ship                        ##

halt_test:                                            ##
	vagrant halt vm-test

halt_ship:                                            ##
	vagrant halt $(SHIP)

up: up_devops up_ship up_test                         ## Start boxes.

halt_devops:                                          ##
	vagrant halt vm-devops

up_ship:                                              ##
	vagrant up $(SHIP)

up_test:                                              ##
	vagrant up vm-test

up_devops:                                            ##
	vagrant up vm-devops

full_provision: full_provision_devops full_provision_ship full_provision_test  ## Full reprovision of boxes

shell_provision_ship:                                      ##
	vagrant provision $(SHIP) --provision-with shell

shell_provision_test:                                      ##
	vagrant provision vm-test --provision-with shell

shell_provision_devops:                                    ##
	vagrant provision vm-devops --provision-with shell

full_provision_ship: shell_provision_ship provision_ship  ##

full_provision_test: shell_provision_test provision_test  ##

full_provision_devops: shell_provision_devops provision_devops  ##

provision: provision_devops provision_ship provision_test  ## Quick re-provision of boxes (only salt)

provision_ship: provision_ship_highstate wait_until_ready ## Provision ship and wait for koha to be ready.

ifdef GITREF
PILLAR = "pillar={\"GITREF\": \"$(GITREF)\"}"
endif
provision_ship_highstate:                             ## Run state.highstate on $(SHIP)
	vagrant ssh $(SHIP) -c 'sudo salt-call --local state.highstate $(PILLAR)'

wait_until_ready:                                     ## Checks if koha is up and running
	vagrant ssh $(SHIP) -c 'sudo docker exec -t koha_container ./wait_until_ready.py'

provision_test:                                       ##
	vagrant ssh vm-test -c 'sudo salt-call --local state.highstate'

provision_devops:                                     ##
	vagrant ssh vm-devops -c 'sudo salt-call --local state.highstate'

ifdef TESTPROFILE
CUKE_PROFILE_ARG=--profile $(TESTPROFILE)
endif

ifdef TESTBROWSER
BROWSER_ARG=BROWSER=$(TESTBROWSER)
endif

ifdef FEATURE
CUKE_ARGS=-n "$(FEATURE)"
endif

test: test_redef cuke_test                            ## Run unit and cucumber tests.

cuke_test:
	vagrant ssh vm-test -c 'cd vm-test && $(BROWSER_ARG) cucumber $(CUKE_PROFILE_ARG) $(CUKE_ARGS)'

test_one:                                              ## Run 'utlaan_via_adminbruker'.
	vagrant ssh vm-test -c 'cd vm-test && $(BROWSER_ARG) cucumber $(CUKE_PROFILE_ARG) -n "Adminbruker låner ut bok til Knut"'

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

clean: clean_report clean_test                         ## Destroy boxes (except $(SHIP) and vm-devops).

clean_report:                                          ## Clean cucumber reports.
	rm -rf test/report || true

clean_test: clean_report                               ## Destroy vm-test box.
	vagrant destroy vm-test --force

clean_devops:                                          ## Destroy vm-devops box.
	vagrant destroy vm-devops --force

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

sublime: install_sublime                               ## Run sublime from within vm-test.
	vagrant ssh vm-test -c 'subl "/vagrant" > subl.log 2> subl.err < /dev/null' &

install_sublime:
	vagrant ssh vm-test -c 'sudo salt-call --local state.sls sublime'

open_intra:                                            ## Open Kohas intra-interface in firefox from vm-test.
	vagrant ssh vm-test -c 'firefox "http://192.168.50.12:8081/" -no-remote > firefox.log 2> firefox.err < /dev/null' &

kibana: install_firefox_on_devops                      ## Run kibanas web ui from inside devops.
	vagrant ssh vm-devops -c 'firefox "http://localhost:9292/index.html#/dashboard/file/logstash.json" -no-remote > firefox.log 2> firefox.err < /dev/null' &

install_firefox_on_devops:
	vagrant ssh vm-devops -c 'sudo salt-call --local state.sls firefox'


# Commands for redef build & dev

test_redef: test_patron_client test_services test_catalinker cuke_redef

cuke_redef:
	vagrant ssh vm-test -c 'cd vm-test && $(BROWSER_ARG) cucumber $(CUKE_PROFILE_ARG) --tags @redef $(CUKE_ARGS)'

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
