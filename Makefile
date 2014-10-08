.PHONY: all test clean help

all: reload provision test                            ## Run tests after (re)loading and (re)provisioning vagrant boxes.

help:                                                 ## Show this help.
	@fgrep -h "##" $(MAKEFILE_LIST) | fgrep -v fgrep | sed -e 's/\\$$//' | sed -e 's/##//'

reload: halt up                                       ## Reload vagrant boxes.

# halt + up is like a reload - except it should also work if there is no machine yet
reload_ext: halt_ext up_ext                           ## Reload vm-ext box.

reload_test: halt_test up_test                        ## Reload vm-test box.

halt: halt_test halt_ext halt_ship                    ## Halt boxes (except vm-devops).

reload_devops: halt_devops up_devops                  ##

halt_ext:                                             ##
	vagrant halt vm-ext

halt_test:                                            ##
	vagrant halt vm-test

halt_ship:                                            ##
	vagrant halt vm-ship

up: up_ship up_ext up_test                            ## Start boxes (except vm-devops).

halt_devops:                                          ##
	vagrant halt vm-devops

up_ship:                                              ##
	vagrant up vm-ship

up_ext:                                               ##
	vagrant up vm-ext

up_test:                                              ##
	vagrant up vm-test

provision: provision_ship provision_ext provision_test ## Reprovision boxes (except vm-devops).

up_devops:                                             ##
	vagrant up vm-devops

# should run vagrant provison but that would take longer as it reinstalls(?) salt
provision_ship:                                       ##
	vagrant ssh vm-ship -c 'sudo salt-call --local state.highstate'

provision_ext:                                        ##
	vagrant ssh vm-ext -c 'sudo salt-call --local state.highstate'

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

test:                                                  ## Run cucumber tests.
	vagrant ssh vm-test -c 'cd vm-test && $(BROWSER_ARG) cucumber $(CUKE_PROFILE_ARG) $(CUKE_ARGS)'

test_one:                                              ## Run 'utlaan_via_adminbruker'.
	vagrant ssh vm-test -c 'cd vm-test && $(BROWSER_ARG) cucumber $(CUKE_PROFILE_ARG) -n "Adminbruker låner ut bok til Knut"'

clean: clean_report clean_test clean_ext               ## Destroy boxes (except vm-ship and vm-devops).

clean_report:                                          ## Clean cucumber reports.
	rm -rf test/report || true

clean_test: clean_report                               ## Destroy vm-test box.
	vagrant destroy vm-test --force

clean_ext:                                             ## Destroy vm-ext box.
	vagrant destroy vm-ext --force

clean_devops:                                          ## Destroy vm-devops box.
	vagrant destroy vm-devops --force

clean_ship:                                            ## Destroy vm-ship box. Prompts for ok.
	vagrant destroy vm-ship

dump_ship:                                             ## DEV: Dump database koha_name to koha_name_dump.sql (standard admin.sls only).
	vagrant ssh vm-ship -c 'sudo apt-get install mysql-client && sudo mysqldump --user admin --password=secret --host 192.168.50.12 --port 3306 --databases koha_name > /vagrant/koha_name_dump.sql'

login_ship:                                            ## DEV: Login to database from vm-ext (standard admin.sls only)
	vagrant ssh vm-ext -c 'sudo mysql --user admin --password=secret --host 192.168.50.12 --port 3306'

sublime: install_sublime                               ## Run sublime from within vm-ext.
	vagrant ssh vm-test -c 'subl "/vagrant" > subl.log 2> subl.err < /dev/null' &

install_sublime:
	vagrant ssh vm-test -c 'sudo salt-call --local state.sls sublime'

kibana: install_firefox_on_devops                      ## Run kibanas web ui from inside devops.
	vagrant ssh vm-devops -c 'firefox "http://localhost/" > firefox.log 2> firefox.err < /dev/null' &

install_firefox_on_devops:
	vagrant ssh vm-devops -c 'sudo salt-call --local state.sls firefox'
