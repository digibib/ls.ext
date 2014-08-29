.PHONY: all test clean

all: reload provision test

reload: reload_ext reload_test

# halt + up is like a reload - except it should also work if there is no machine yet
reload_ext: halt_ext up_ext

reload_test: halt_test up_test

halt: halt_ext halt_test

halt_ext:
	vagrant halt ls.ext

halt_test:
	vagrant halt ls.test

up: up_ext up_test

up_ext:
	vagrant up ls.ext

up_test:
	vagrant up ls.test

provision: provision_ext provision_test

# should run vagrant provison but that would take longer as it reinstalls(?) salt
provision_ext:
	vagrant ssh ls.ext -c 'sudo salt-call --local state.highstate'

provision_test:
	vagrant ssh ls.test -c 'sudo salt-call --local state.highstate'

ifdef TESTPROFILE
CUKE_PROFILE_ARG=--profile $(TESTPROFILE)
endif

ifdef TESTBROWSER
BROWSER_ARG=BROWSER=$(TESTBROWSER)
endif

ifdef FEATURE
CUKE_ARGS=-n "$(FEATURE)"
endif

test:
	vagrant ssh ls.test -c 'cd ls.test && $(BROWSER_ARG) cucumber $(CUKE_PROFILE_ARG) $(CUKE_ARGS)'

clean: clean_report clean_test clean_ext

clean_report:
	rm -rf test/report || true

clean_test: clean_report
	vagrant destroy ls.test --force

clean_ext:
	vagrant destroy ls.ext --force

sublime: install_sublime
	vagrant ssh ls.test -c 'subl "/vagrant" > subl.log 2> subl.err < /dev/null' &

install_sublime:
	vagrant ssh ls.test -c 'sudo salt-call --local state.sls sublime'

