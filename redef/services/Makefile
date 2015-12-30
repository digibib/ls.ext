.PHONY: build

all: test build

IMAGE=digibib/redef-services
CONTAINER=redef_services_container

test:
	./gradlew check test

stop:
	sudo docker stop $(CONTAINER) || true

build-onejar:
	./gradlew build oneJar

clean:
	./gradlew clean

build: build-onejar
	sudo docker build --tag $(IMAGE) /vagrant/redef/services

KOHA_URL          ?= http://192.168.50.12:8081
KOHA_USER         ?= admin
KOHA_PASSWORD     ?= secret
TRIPLESTORE_PORT  ?= http://192.168.50.12:3030
DATA_BASEURI      ?= http://192.168.50.12:8005
ELASTICSEARCH_URL ?= http://192.168.50.12:9200

run-alternative: build rm
	sudo docker run -d -p 8080:8080 \
		-e KOHA_URL=$(KOHA_URL) \
		-e KOHA_USER=$(KOHA_USER) \
		-e KOHA_PASSWORD=$(KOHA_PASSWORD) \
		-e TRIPLESTORE_PORT=$(TRIPLESTORE_PORT) \
		-e DATA_BASEURI=$(DATA_BASEURI) \
		-e ELASTICSEARCH_URL=$(ELASTICSEARCH_URL) \
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
