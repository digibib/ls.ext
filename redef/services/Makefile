.PHONY: build

all: test build run

IMAGE=digibib/redef-services
CONTAINER=redef_services_container

test:
	./gradlew check test

run-dev: run

run:
	sudo salt-call --retcode-passthrough --local state.sls redef.services.builtrun

stop:
	sudo docker stop $(CONTAINER) || true

build-onejar:
	./gradlew build oneJar

clean:
	./gradlew clean

build: build-onejar
	sudo docker build --tag $(IMAGE) /vagrant/redef/services


KOHA_URL      ?= http://192.168.50.12:8081
KOHA_USER     ?= admin
KOHA_PASSWORD ?= secret
FUSEKI_URL    ?= http://192.168.50.12:3030
DATA_BASEURI  ?= http://192.168.50.12:8005

run-alternative: build rm
	sudo docker run -d -p 8080:8080 \
		-e KOHA_URL=$(KOHA_URL) \
		-e KOHA_USER=$(KOHA_USER) \
		-e KOHA_PASSWORD=$(KOHA_PASSWORD) \
		-e FUSEKI_URL=$(FUSEKI_URL) \
		-e DATA_BASEURI=$(DATA_BASEURI) \
		--name $(CONTAINER) $(IMAGE)

rm: stop
	sudo docker rm $(CONTAINER) || true

log-f:
	sudo docker logs -f $(CONTAINER)

inspect:
	sudo docker exec -it $(CONTAINER) /bin/bash

push: # needs TAG
ifndef TAG
	@echo "You must specify TAG when pushing"
	exit 1
endif
	sudo docker tag -f $(IMAGE) $(IMAGE):$(TAG)
	sudo docker push $(IMAGE):$(TAG)
