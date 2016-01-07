all: build

IMAGE=digibib/redef-catalinker
CONTAINER=redef_catalinker_container
MODULE_TEST_CONTAINER=redef_catalinker_test_container
HOST_VOLUME_BINDINGS=-v /vagrant/redef/catalinker/client:/usr/src/app/client \
	-v /vagrant/redef/catalinker/public:/usr/src/app/public \
	-v /vagrant/redef/catalinker/module-test:/usr/src/app/module-test

run-dev:
	sudo docker run -it $(HOST_VOLUME_BINDINGS) -p 8010:8010 --name dockercompose_catalinker dockercompose_catalinker npm run-script start-dev

build:
	sudo docker build --tag $(IMAGE) /vagrant/redef/catalinker

stop:
	sudo docker stop $(CONTAINER) || true
	sudo docker stop dockercompose_catalinker || true

stop-test-instance:
	sudo docker stop $(MODULE_TEST_CONTAINER) || true

rm: stop
	sudo docker rm $(CONTAINER) || true
	sudo docker rm dockercompose_catalinker || true

rm-test-instance: stop-test-instance 
	sudo docker rm $(MODULE_TEST_CONTAINER) || true

run-test-instance: rm-test-instance
	sudo docker run -d -p 7010:8000 --name $(MODULE_TEST_CONTAINER) $(HOST_VOLUME_BINDINGS) dockercompose_catalinker

lint:
	sudo docker run --rm $(HOST_VOLUME_BINDINGS) dockercompose_catalinker npm run jscs -- server.js module-test client/test --fix
	sudo docker run --rm $(HOST_VOLUME_BINDINGS) dockercompose_catalinker npm run jshint -- server.js module-test client/test


test: lint run-test-instance
	sudo docker run --rm $(HOST_VOLUME_BINDINGS) -p 7080:8080 -p 6666:6666 dockercompose_catalinker npm test
	@echo "*** Log from module test container"
	sudo docker logs $(MODULE_TEST_CONTAINER)

run-dev-debug: rm
	sudo docker run -it $(HOST_VOLUME_BINDINGS) -p 8010:8010 --name $(CONTAINER) dockercompose_catalinker npm run-script start-dev-debug

test-debug:
	sudo docker run -it --rm $(HOST_VOLUME_BINDINGS) dockercompose_catalinker npm run-script test-debug

module-test-debug: run-test-instance
	sudo docker run -it --rm $(HOST_VOLUME_BINDINGS) dockercompose_catalinker npm run-script module-test-debug

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
