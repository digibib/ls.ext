all: build run

IMAGE=digibib/redef-services
CONTAINER=redef-services


build:
	mvn clean install
	sudo docker build --tag $(IMAGE) /vagrant/services

stop:
	sudo docker stop $(CONTAINER) || true

rm: stop
	sudo docker rm $(CONTAINER) || true

run: build rm
	sudo docker run -d -p 8080:8080 --name $(CONTAINER) $(IMAGE)

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
