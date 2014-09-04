.PHONY: all test clean help

all: reload provision test                            ##

help:                                                 ## Show this help.
	@fgrep -h "##" $(MAKEFILE_LIST) | fgrep -v fgrep | sed -e 's/\\$$//' | sed -e 's/##//'

reload: halt up                                       ##

# halt + up is like a reload - except it should also work if there is no machine yet
reload_ext: halt_ext up_ext                           ##

reload_test: halt_test up_test                        ##

halt: halt_test halt_ext halt_db                      ##

reload_devops: halt_devops up_devops                  ##

halt_ext:                                             ##
	vagrant halt ls.ext

halt_test:                                            ##
	vagrant halt ls.test

halt_db:                                              ##
	vagrant halt ls.db

up: up_db up_ext up_test                              ##

halt_devops:                                          ##
	vagrant halt ls.devops

up_db:                                                ##
	vagrant up ls.db

up_ext:                                               ##
	vagrant up ls.ext

up_test:                                              ##
	vagrant up ls.test

provision: provision_db provision_ext provision_test  ##

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

test:                                                  ##
	vagrant ssh ls.test -c 'cd ls.test && $(BROWSER_ARG) cucumber $(CUKE_PROFILE_ARG) $(CUKE_ARGS)'

clean: clean_report clean_test clean_ext               ## 

clean_report:                                          ## 
	rm -rf test/report || true

clean_test: clean_report                               ##
	vagrant destroy ls.test --force

clean_ext:                                             ##
	vagrant destroy ls.ext --force

clean_devops:                                          ## 
	vagrant destroy ls.devops --force

clean_db:                                              ##
	vagrant destroy ls.db

sublime: install_sublime                               ##
	vagrant ssh ls.test -c 'subl "/vagrant" > subl.log 2> subl.err < /dev/null' &

install_sublime:                                       ## 
	vagrant ssh ls.test -c 'sudo salt-call --local state.sls sublime'

kibana: install_firefox_on_devops                      ##
	vagrant ssh ls.devops -c 'firefox "http://localhost/" > firefox.log 2> firefox.err < /dev/null' &

install_firefox_on_devops:                             ## 
	vagrant ssh ls.devops -c 'sudo salt-call --local state.sls firefox'
