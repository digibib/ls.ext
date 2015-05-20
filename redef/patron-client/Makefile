all: build run

SKELETON_IMAGE=digibib/redef-patron-client-skeleton
IMAGE=digibib/redef-patron-client
CONTAINER=redef_patron_client_skeleton_container
MODULE_TEST_CONTAINER=redef-patron-client-test-instance

test: lint unit_test module-test

run-dev:
	sudo salt-call --local state.sls redef.patron-client.skeletonrun

run:
	sudo salt-call --local state.sls redef.patron-client.builtrun

build:
	sudo salt-call --local state.sls redef.patron-client.builtrun

build_skeleton:
	sudo salt-call --local state.sls redef.patron-client.skeletonbuild

stop:
	sudo docker stop $(CONTAINER) || true

stop-test-instance:
	sudo docker stop $(MODULE_TEST_CONTAINER) || true

rm: stop
	sudo docker rm $(CONTAINER) || true

rm-test-instance: stop-test-instance 
	sudo docker rm $(MODULE_TEST_CONTAINER) || true

run-test-instance: build_skeleton rm-test-instance
	sudo docker run -d -p 7000:8000 --name $(MODULE_TEST_CONTAINER) -e "SERVICES_PORT=tcp://192.168.50.12:6666" -v /vagrant/redef/patron-client:/usr/src/app $(SKELETON_IMAGE)

lint: build_skeleton
	sudo docker run --rm -v /vagrant/redef/patron-client:/usr/src/app $(SKELETON_IMAGE) jslint *.js **/*.js

unit_test: build_skeleton
	sudo docker run --rm -v /vagrant/redef/patron-client:/usr/src/app $(SKELETON_IMAGE) npm test

module-test: run-test-instance
	sudo docker run --rm -v /vagrant/redef/patron-client:/usr/src/app -p 7080:8080 -p 6666:6666 $(SKELETON_IMAGE) npm run-script module-test
	@echo "*** Log from module test container"
	sudo docker logs $(MODULE_TEST_CONTAINER)

run-dev-debug: build_skeleton rm
	sudo docker run -it -v /vagrant/redef/patron-client:/usr/src/app -p 8000:8000 -e "SERVICES_PORT=$(SERVICES_PORT)" --name $(CONTAINER) $(SKELETON_IMAGE) npm run-script start-dev-debug

test-debug: build_skeleton
	sudo docker run -it --rm -v /vagrant/redef/patron-client:/usr/src/app $(SKELETON_IMAGE) npm run-script test-debug

module-test-debug: build_skeleton run-test-instance
	sudo docker run -it --rm -v /vagrant/redef/patron-client:/usr/src/app $(SKELETON_IMAGE) npm run-script module-test-debug

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
