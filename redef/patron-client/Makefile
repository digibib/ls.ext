all: build run

SKELETON_IMAGE=redef-patron-client-skeleton
IMAGE=digibib/redef-patron-client
CONTAINER=redef-patron-client
MODULE_TEST_CONTAINER=redef-patron-client-test-instance
SERVICES_PORT="tcp://192.168.50.50:8080"

build: build_skeleton build_app

build_skeleton:
	sudo docker build --tag $(SKELETON_IMAGE) --file="Dockerfile-skeleton" /vagrant/patron-client

build_app:
	sudo docker build --tag $(IMAGE) /vagrant/patron-client

stop:
	sudo docker stop $(CONTAINER) || true

stop-test-instance:
	sudo docker stop $(MODULE_TEST_CONTAINER) || true

rm: stop
	sudo docker rm $(CONTAINER) || true

rm-test-instance: stop-test-instance 
	sudo docker rm $(MODULE_TEST_CONTAINER) || true

run: build rm
	sudo docker run -d -p 8000:8000 -e "SERVICES_PORT=$(SERVICES_PORT)" --name $(CONTAINER) $(IMAGE)

run-test-instance: build_skeleton rm-test-instance
	sudo docker run -d -p 7000:8000 --name $(MODULE_TEST_CONTAINER) -e "SERVICES_PORT=tcp://192.168.50.50:7080" -v /vagrant/patron-client:/usr/src/app $(SKELETON_IMAGE)

lint: build_skeleton
	sudo docker run --rm -v /vagrant/patron-client:/usr/src/app $(SKELETON_IMAGE) jslint *.js **/*.js

test: build_skeleton
	sudo docker run --rm -v /vagrant/patron-client:/usr/src/app $(SKELETON_IMAGE) npm test

module-test: build_skeleton run-test-instance
	sudo docker run --rm -v /vagrant/patron-client:/usr/src/app -p 7080:8080 $(SKELETON_IMAGE) npm run-script module-test
	@echo "*** Log from module test container"
	sudo docker logs $(MODULE_TEST_CONTAINER)

run-dev: build_skeleton rm
	sudo docker run -d -v /vagrant/patron-client:/usr/src/app -p 8000:8000 -e "SERVICES_PORT=$(SERVICES_PORT)" --name $(CONTAINER) $(SKELETON_IMAGE) npm run-script start-dev

run-dev-debug: build_skeleton rm
	sudo docker run -it -v /vagrant/patron-client:/usr/src/app -p 8000:8000 -e "SERVICES_PORT=$(SERVICES_PORT)" --name $(CONTAINER) $(SKELETON_IMAGE) npm run-script start-dev-debug

test-debug: build_skeleton
	sudo docker run -it --rm -v /vagrant/patron-client:/usr/src/app $(SKELETON_IMAGE) npm run-script test-debug

module-test-debug: build_skeleton run-test-instance
	sudo docker run -it --rm -v /vagrant/patron-client:/usr/src/app $(SKELETON_IMAGE) npm run-script module-test-debug

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
