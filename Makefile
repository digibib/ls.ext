.PHONY: all test clean help

all: reload provision test                            ## Run tests after (re)loading and (re)provisioning vagrant boxes.

help:                                                 ## Show this help.
	@fgrep -h "##" $(MAKEFILE_LIST) | fgrep -v fgrep | sed -e 's/\\$$//' | sed -e 's/##//'

reload: halt up                                       ## Reload vagrant boxes.

# halt + up is like a reload - except it should also work if there is no machine yet
reload_ext: halt_ext up_ext                           ## Reload ls.ext box.

reload_test: halt_test up_test                        ## Reload ls.test box.

halt: halt_test halt_ext halt_db                      ## Halt boxes (except ls.devops).

reload_devops: halt_devops up_devops                  ## 

halt_ext:                                             ## 
	vagrant halt ls.ext

halt_test:                                            ##
	vagrant halt ls.test

halt_db:                                              ##
	vagrant halt ls.db

up: up_db up_ext up_test                              ## Start boxes (except ls.devops).

halt_devops:                                          ##
	vagrant halt ls.devops

up_db:                                                ##
	vagrant up ls.db

up_ext:                                               ##
	vagrant up ls.ext

up_test:                                              ##
	vagrant up ls.test

provision: provision_db provision_ext provision_test  ## Reprovision boxes (except ls.devops).

up_devops:                                            ##
	vagrant up ls.devops

# should run vagrant provison but that would take longer as it reinstalls(?) salt
provision_db:                                         ##
	vagrant ssh ls.db -c 'sudo salt-call --local state.highstate'

provision_ext:                                        ##
	vagrant ssh ls.ext -c 'sudo salt-call --local state.highstate'

provision_test:                                       ##
	vagrant ssh ls.test -c 'sudo salt-call --local state.highstate'

provision_devops:                                     ##
	vagrant ssh ls.devops -c 'sudo salt-call --local state.highstate'

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
	vagrant ssh ls.test -c 'cd ls.test && $(BROWSER_ARG) cucumber $(CUKE_PROFILE_ARG) $(CUKE_ARGS)'

test_one:                                              ## Run 'utlaan_via_adminbruker'.
	vagrant ssh ls.test -c 'cd ls.test && $(BROWSER_ARG) cucumber $(CUKE_PROFILE_ARG) "features/utlaan_via_adminbruker.feature"'

clean: clean_report clean_test clean_ext               ## Destroy boxes (except ls.devops).

clean_report:                                          ## Clean cucumber reports.
	rm -rf test/report || true

clean_test: clean_report                               ## Destroy ls.test box.
	vagrant destroy ls.test --force

clean_ext:                                             ## Destroy ls.ext box.
	vagrant destroy ls.ext --force

clean_devops:                                          ## Destroy ls.devops box.
	vagrant destroy ls.devops --force

clean_db:                                              ## Destroy ls.db box. Prompts for ok.
	vagrant destroy ls.db

dump_db:                                               ## DEV: Dump database koha_name to koha_name_dump.sql (standard admin.sls only).
	vagrant ssh ls.db -c 'sudo apt-get install mysql-client && sudo mysqldump --user admin --password=secret --host 192.168.50.12 --port 3306 --databases koha_name > /vagrant/koha_name_dump.sql'

sublime: install_sublime                               ## Run sublime from within ls.ext.
	vagrant ssh ls.test -c 'subl "/vagrant" > subl.log 2> subl.err < /dev/null' &

install_sublime:
	vagrant ssh ls.test -c 'sudo salt-call --local state.sls sublime'

kibana: install_firefox_on_devops                      ## Run kibanas web ui from inside devops.
	vagrant ssh ls.devops -c 'firefox "http://localhost/" > firefox.log 2> firefox.err < /dev/null' &

install_firefox_on_devops:
	vagrant ssh ls.devops -c 'sudo salt-call --local state.sls firefox'
