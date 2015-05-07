.PHONY: build test run

REDEF_HOME=/vagrant
VAGRANT_BOX=redef-devbox
VAGRANT_SSH_CMD=vagrant ssh $(VAGRANT_BOX) -c

KOHA_PORT     ?= http://192.168.50.12:8081
KOHA_USER     ?= admin
KOHA_PASSWORD ?= secret
FUSEKI_PORT   ?= http://192.168.50.50:3030

all: up provision build test run

up:
	vagrant up $(VAGRANT_BOX)

provision:
	vagrant provision $(VAGRANT_BOX)

build:
	$(VAGRANT_SSH_CMD) 'cd $(REDEF_HOME)/services && make build'

run: run-services run-patron-client run-catalinker

run-patron-client:
	$(VAGRANT_SSH_CMD) 'cd $(REDEF_HOME)/patron-client && make run'
	echo "open http://192.168.50.50:8000/ for patron-client service in PROD mode"

run-dev: up 
	echo "open http://192.168.50.50:8000/ for patron-client service in DEV mode"
	$(VAGRANT_SSH_CMD) 'cd $(REDEF_HOME)/patron-client && make run-dev'
	echo "open http://192.168.50.50:8081/ for catalinker service in DEV mode"
	$(VAGRANT_SSH_CMD) 'cd $(REDEF_HOME)/catalinker && make run-dev'

test: test-patron-client test-services test-catalinker

test-patron-client:
	$(VAGRANT_SSH_CMD) 'cd $(REDEF_HOME)/services && make stop || true'
	$(VAGRANT_SSH_CMD) 'cd $(REDEF_HOME)/patron-client && make lint test module-test'

test-services:
	$(VAGRANT_SSH_CMD) 'cd $(REDEF_HOME)/services && make test'

log-f:
	$(VAGRANT_SSH_CMD) 'cd $(REDEF_HOME)/patron-client && make log-f'

inspect-patron-client:
	$(VAGRANT_SSH_CMD) 'cd $(REDEF_HOME)/patron-client && make inspect'

inspect-services:
	$(VAGRANT_SSH_CMD) 'cd $(REDEF_HOME)/services && make inspect'

run-services:
	$(VAGRANT_SSH_CMD) 'cd $(REDEF_HOME)/services && make run \
	-e KOHA_PORT=$(KOHA_PORT) \
	-e KOHA_USER=$(KOHA_USER) \
	-e KOHA_PASSWORD=$(KOHA_PASSWORD) \
	-e FUSEKI_PORT=$(FUSEKI_PORT)'
	echo "open http://192.168.50.50:8080/ for services service in PROD mode"

run-db:
	$(VAGRANT_SSH_CMD) 'cd $(REDEF_HOME)/services && make run-db'
	echo "open http://192.168.50.50:3030/ for services db in PROD mode"


stop-services:
	$(VAGRANT_SSH_CMD) 'cd $(REDEF_HOME)/services && make stop'
	echo "stopping http://192.168.50.50:8080/ services"

stop-db:
	$(VAGRANT_SSH_CMD) 'cd $(REDEF_HOME)/services && make stop-db'
	echo "stopping http://192.168.50.50:3030/ services db"

run-catalinker:
	$(VAGRANT_SSH_CMD) 'cd $(REDEF_HOME)/catalinker && make run'

stop-catalinker:
	$(VAGRANT_SSH_CMD) 'cd $(REDEF_HOME)/catalinker && make stop'

test-catalinker:
	$(VAGRANT_SSH_CMD) 'cd $(REDEF_HOME)/catalinker && make test'

halt:
	vagrant halt $(VAGRANT_BOX)

login: # needs EMAIL, PASSWORD, USER
	@ $(VAGRANT_SSH_CMD) 'sudo docker login --email=$(EMAIL) --username=$(USER) --password=$(PASSWORD)'

TAG = "$(shell git rev-parse HEAD)"
push:
	$(VAGRANT_SSH_CMD) 'cd $(REDEF_HOME)/patron-client && make push TAG=$(TAG)'
	$(VAGRANT_SSH_CMD) 'cd $(REDEF_HOME)/services && make push TAG=$(TAG)'
	$(VAGRANT_SSH_CMD) 'cd $(REDEF_HOME)/catalinker && make push TAG=$(TAG)'

docker-cleanup:
	@echo "cleaning up unused containers and images"
	@$(VAGRANT_SSH_CMD) 'sudo $(REDEF_HOME)/docker_cleanup.sh'
