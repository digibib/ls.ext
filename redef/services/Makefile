.PHONY: build

all: test build build-docker run

IMAGE=digibib/redef-services
CONTAINER=redef-services-container

KOHA_URL      ?= http://192.168.50.12:8081
KOHA_USER     ?= admin
KOHA_PASSWORD ?= secret
FUSEKI_URL    ?= http://192.168.50.50:3030

build:
	./gradlew --daemon build oneJar

build-docker: build
	sudo docker build --tag $(IMAGE) /vagrant/services

stop:
	sudo docker stop $(CONTAINER) || true

rm: stop rm-db run-db
	sudo docker rm $(CONTAINER) || true

run: build-docker rm rm-db run-db
	sudo docker run -d -p 8080:8080 \
		-e KOHA_URL=$(KOHA_URL) \
		-e KOHA_USER=$(KOHA_USER) \
		-e KOHA_PASSWORD=$(KOHA_PASSWORD) \
		-e FUSEKI_URL=$(FUSEKI_URL) \
		--name $(CONTAINER) $(IMAGE)

rm-db: stop-db
	sudo docker rm $(DB_CONTAINER) || true

test:
	./gradlew --daemon test

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
