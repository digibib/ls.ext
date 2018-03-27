all: build
CLPATH=$(shell pwd)

GITREF=$(shell git rev-parse HEAD)
IMAGE=digibib/redef-catalinker
CONTAINER=catalinker
MODULE_TEST_CONTAINER=catalinker_test
HOST_VOLUME_BINDINGS=-v $(CLPATH)/client:/usr/src/app/client \
	-v $(CLPATH)/public:/usr/src/app/public \
	-v $(CLPATH)/server:/usr/src/app/server \
	-v $(CLPATH)/module-test:/usr/src/app/module-test

run-dev:
	docker run -it $(HOST_VOLUME_BINDINGS) -p 8010:8010 --name dockercompose_catalinker $(IMAGE):$(GITREF) npm run-script start-dev

stop:
	docker stop $(CONTAINER) || true
	docker stop dockercompose_catalinker || true

stop-test-instance:
	docker stop $(MODULE_TEST_CONTAINER) || true

rm: stop
	docker rm $(CONTAINER) || true
	docker rm dockercompose_catalinker || true

rm-test-instance: stop-test-instance
	docker rm $(MODULE_TEST_CONTAINER) || true

run-test-instance: rm-test-instance
	docker run -d -p 7010:8000 --name $(MODULE_TEST_CONTAINER) $(HOST_VOLUME_BINDINGS) $(IMAGE):$(GITREF)

lint:
	docker run --rm $(HOST_VOLUME_BINDINGS) $(IMAGE):$(GITREF) npm run eslint server/server.js


test: lint run-test-instance
	docker exec $(MODULE_TEST_CONTAINER) npm test
	@echo "*** Log from module test container"
	docker logs $(MODULE_TEST_CONTAINER)
	docker stop $(MODULE_TEST_CONTAINER)
	docker rm $(MODULE_TEST_CONTAINER)

run-dev-debug: rm
	docker run -it $(HOST_VOLUME_BINDINGS) -p 8010:8010 --name $(CONTAINER) $(IMAGE):$(GITREF) npm run-script start-dev-debug

test-debug:
	docker run -it --rm $(HOST_VOLUME_BINDINGS) $(IMAGE):$(GITREF) npm run-script test-debug

module-test-debug: run-test-instance
	docker run -it --rm $(HOST_VOLUME_BINDINGS) $(IMAGE):$(GITREF) npm run-script module-test-debug

log-f:
	docker logs -f $(CONTAINER)

inspect:
	docker exec -it $(CONTAINER) /bin/bash


push: # needs TAG
ifndef TAG
	@echo "You must specify TAG when pushing"
	exit 1
endif
	docker push $(IMAGE):$(TAG)
