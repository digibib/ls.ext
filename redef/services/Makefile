.PHONY: build

all: test build

IMAGE=digibib/redef-services
TESTIMAGE=services_test_container
CONTAINER=redef_services_container

test:
	 # (same as build, but build will also run check and test tasks)
	sudo docker build -t $(TESTIMAGE) -f Dockerfile.build /vagrant/redef/services

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
