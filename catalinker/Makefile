all: build run

SKELETON_IMAGE=redef-catalinker-skeleton
IMAGE=digibib/redef-catalinker
CONTAINER=redef-catalinker
MODULE_TEST_CONTAINER=redef-catalinker-test-instance
SERVICES_PORT="tcp://192.168.50.50:8080"

build: build_skeleton build_app

build_skeleton:
	sudo docker build --tag $(SKELETON_IMAGE) --file="Dockerfile-skeleton" /vagrant/catalinker
	@echo "Gemfile.lock copied to workspace"
	sudo docker run --rm $(SKELETON_IMAGE) "cat /usr/src/Gemfile.lock" > /vagrant/catalinker/Gemfile.lock

build_app:
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
	echo "open http://192.168.50.50:8081/ for catalinker in PROD mode"

run-test-instance: build_skeleton rm-test-instance
	sudo docker run -d -p 7081:4567 --name $(MODULE_TEST_CONTAINER) -e "SERVICES_PORT=$(SERVICES_PORT)" -v /vagrant/catalinker:/usr/src/app $(SKELETON_IMAGE)
	echo "open http://192.168.50.50:7081/ for catalinker in TEST mode"

run-dev: build_skeleton rm
	echo "open http://192.168.50.50:8081/ for catalinker in DEV mode"
	sudo docker run -d -p 8081:4567 --name $(CONTAINER) -e "SERVICES_PORT=$(SERVICES_PORT)" -v /vagrant/catalinker:/usr/src/app $(SKELETON_IMAGE)

test: build_skeleton
	sudo docker run -it --rm -v /vagrant/catalinker:/usr/src/app $(SKELETON_IMAGE) rake test

module-test: run-test-instance
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
