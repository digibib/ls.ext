all: build run

PROJECT=catalinker
IMAGE=digibib/redef-catalinker
CONTAINER=redef-catalinker
MODULE_TEST_CONTAINER=redef-catalinker-test-instance
SERVICES_PORT="tcp://192.168.50.50:8080"

build:
	sudo docker build --tag $(IMAGE) /vagrant/catalinker

stop:
	sudo docker stop $(CONTAINER) || true

stop-test-instance:
	sudo docker stop $(MODULE_TEST_CONTAINER) || true

rm: stop
	sudo docker rm $(CONTAINER) || true

rm-test-instance: stop-test-instance 
	sudo docker rm $(MODULE_TEST_CONTAINER) || true

run: build rm
	sudo docker run -d -p 8081:4567 -e "SERVICES_PORT=$(SERVICES_PORT)" --name $(CONTAINER) $(IMAGE)

run-test-instance: build rm-test-instance
	sudo docker run -d -p 7081:4567 --name $(MODULE_TEST_CONTAINER) -e "SERVICES_PORT=$(SERVICES_PORT)" -v /vagrant/catalinker:/usr/src/app $(IMAGE)

test: build
	sudo docker run --rm -v /vagrant/catalinker:/usr/src/app $(IMAGE) rake test

module-test: build run-test-instance
	echo "To do: testing"

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
	sudo docker push $(IMAGE)