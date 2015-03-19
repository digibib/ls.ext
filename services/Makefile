all: build run

IMAGE=digibib/redef-services
CONTAINER=redef-services
DB_IMAGE=fisch42/fuseki
DB_CONTAINER=fuseki

build:
	mvn clean install
	sudo docker build --tag $(IMAGE) /vagrant/services

stop: stop-db
	sudo docker stop $(CONTAINER) || true

rm: stop rm-db run-db
	sudo docker rm $(CONTAINER) || true

run: build rm rm-db run-db
	sudo docker run -d -p 8080:8080 --name $(CONTAINER) $(IMAGE)

stop-db:
	sudo docker stop $(DB_CONTAINER) || true

rm-db: stop-db
	sudo docker rm $(DB_CONTAINER) || true

run-db: rm-db
	sudo docker run -d -p 3030:3030 --name $(DB_CONTAINER) $(DB_IMAGE)

test:
	mvn test

log-f:
	sudo docker logs -f $(CONTAINER)

inspect:
	sudo docker exec -it $(CONTAINER) /bin/bash

push: # needs TAG
ifndef TAG
	@echo "You must specify TAG when pushing"
	exit 1
endif
	sudo docker tag $(IMAGE) $(IMAGE):$(TAG)
	sudo docker push $(IMAGE)
