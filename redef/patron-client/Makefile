GITREF=$(shell git rev-parse HEAD)
IMAGE=digibib/redef-patron-client
CONTAINER=patron_client

PCPATH=$(shell pwd)

HOST_VOLUME_BINDINGS=-v $(PCPATH)/src:/usr/src/app/src \
	-v $(PCPATH)/test:/usr/src/app/test

.PHONY: test lit logs push

lint:
	docker run --rm $(HOST_VOLUME_BINDINGS) $(IMAGE):$(GITREF) npm run -s lint

test: lint
	docker run --rm $(HOST_VOLUME_BINDINGS) $(IMAGE):$(GITREF) npm test

logs:
	docker logs -f $(CONTAINER)

push:
ifndef TAG
	@echo "You must specify TAG when pushing"
	exit 1
endif
	docker push $(IMAGE):$(TAG)
