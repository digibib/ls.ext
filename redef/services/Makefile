.PHONY: build

all: build

IMAGE=digibib/redef-services
TESTIMAGE=services_test_container
CONTAINER=services

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
