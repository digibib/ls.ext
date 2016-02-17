IMAGE=dockercompose_patron-client
DOCKERHUB=digibib/redef-patron-client
CONTAINER=redef_patron_client_container
HOST_VOLUME_BINDINGS=-v /vagrant/redef/patron-client/src:/usr/src/app/src \
	-v /vagrant/redef/patron-client/test:/usr/src/app/test

.PHONY: test

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
	sudo docker tag -f $(IMAGE) $(DOCKERHUB):$(TAG)
	sudo docker push $(DOCKERHUB):$(TAG)
