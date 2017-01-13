all: build
ifdef NOVAGRANT
CLPATH=$(shell pwd)
else
CMD=vagrant ssh $(SHIP)
CLPATH=/vagrant/redef/catalinker
endif

IMAGE=digibib/redef-catalinker
CONTAINER=catalinker
MODULE_TEST_CONTAINER=catalinker_test
HOST_VOLUME_BINDINGS=-v $(CLPATH)/client:/usr/src/app/client \
	-v $(CLPATH)/public:/usr/src/app/public \
	-v $(CLPATH)/server:/usr/src/app/server \
	-v $(CLPATH)/module-test:/usr/src/app/module-test

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
	sudo docker run --rm $(HOST_VOLUME_BINDINGS) dockercompose_catalinker npm run eslint client/src/main.js server/server.js


test: lint run-test-instance
	sudo docker exec $(MODULE_TEST_CONTAINER) npm test
	@echo "*** Log from module test container"
	sudo docker logs $(MODULE_TEST_CONTAINER)
	sudo docker stop $(MODULE_TEST_CONTAINER)
	sudo docker rm $(MODULE_TEST_CONTAINER)

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
	sudo docker push $(IMAGE):$(TAG)
