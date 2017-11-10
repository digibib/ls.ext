.PHONY: build

all: build

IMAGE=digibib/redef-services
TESTIMAGE=services_test_container
CONTAINER=services

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
