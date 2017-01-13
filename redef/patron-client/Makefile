IMAGE=dockercompose_patron_client
DOCKERHUB=digibib/redef-patron-client
CONTAINER=patron_client

ifdef NOVAGRANT
PCPATH=$(shell pwd)
else
CMD=vagrant ssh $(SHIP)
PCPATH=/vagrant/redef/patron-client
endif

HOST_VOLUME_BINDINGS=-v $(PCPATH)/src:/usr/src/app/src \
	-v $(PCPATH)/test:/usr/src/app/test

.PHONY: test lit logs push

lint:
	sudo docker run --rm $(HOST_VOLUME_BINDINGS) $(IMAGE) npm run -s lint

test: lint
	sudo docker run --rm $(HOST_VOLUME_BINDINGS) $(IMAGE) npm test

logs:
	sudo docker logs -f $(CONTAINER)

push:
ifndef TAG
	@echo "You must specify TAG when pushing"
	exit 1
endif
	sudo docker push $(DOCKERHUB):$(TAG)
