all: build run

SKELETON_IMAGE=digibib/redef-catalinker-skeleton
IMAGE=digibib/redef-catalinker
CONTAINER=redef_catalinker_container
DEV_CONTAINER=redef_catalinker_skeleton_container
MODULE_TEST_CONTAINER=redef_catalinker_test_container
HOST_VOLUME_BINDINGS=-v /vagrant/redef/catalinker/client:/usr/src/app/client \
	-v /vagrant/redef/catalinker/public:/usr/src/app/public \
	-v /vagrant/redef/catalinker/module-test:/usr/src/app/module-test

run-dev:
	sudo docker run -it $(HOST_VOLUME_BINDINGS) -p 8010:8010 --name $(DEV_CONTAINER) $(SKELETON_IMAGE) npm run-script start-dev

run:
	sudo salt-call --local state.sls redef.catalinker.builtrun

build:
	sudo salt-call --local state.sls redef.catalinker.builtrun

build_skeleton:
	sudo salt-call --local state.sls redef.catalinker.skeletonbuild

stop:
	sudo docker stop $(CONTAINER) || true
	sudo docker stop $(DEV_CONTAINER) || true

stop-test-instance:
	sudo docker stop $(MODULE_TEST_CONTAINER) || true

rm: stop
	sudo docker rm $(CONTAINER) || true
	sudo docker rm $(DEV_CONTAINER) || true

rm-test-instance: stop-test-instance 
	sudo docker rm $(MODULE_TEST_CONTAINER) || true

run-test-instance: build_skeleton rm-test-instance
	sudo docker run -d -p 7010:8000 --name $(MODULE_TEST_CONTAINER) $(HOST_VOLUME_BINDINGS) $(SKELETON_IMAGE)

lint: build_skeleton
	sudo docker run --rm $(HOST_VOLUME_BINDINGS) $(SKELETON_IMAGE) npm run jscs -- server.js module-test test --fix
	sudo docker run --rm $(HOST_VOLUME_BINDINGS) $(SKELETON_IMAGE) npm run jshint -- server.js module-test test


test: lint run-test-instance
	sudo docker run --rm $(HOST_VOLUME_BINDINGS) -p 7080:8080 -p 6666:6666 $(SKELETON_IMAGE) npm test
	@echo "*** Log from module test container"
	sudo docker logs $(MODULE_TEST_CONTAINER)

run-dev-debug: build_skeleton rm
	sudo docker run -it $(HOST_VOLUME_BINDINGS) -p 8010:8010 --name $(CONTAINER) $(SKELETON_IMAGE) npm run-script start-dev-debug

test-debug: build_skeleton
	sudo docker run -it --rm $(HOST_VOLUME_BINDINGS) $(SKELETON_IMAGE) npm run-script test-debug

module-test-debug: build_skeleton run-test-instance
	sudo docker run -it --rm $(HOST_VOLUME_BINDINGS) $(SKELETON_IMAGE) npm run-script module-test-debug

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
