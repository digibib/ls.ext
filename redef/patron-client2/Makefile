CONTAINER=dockercompose_patron-client
HOST_VOLUME_BINDINGS=-v /vagrant/redef/patron-client2/src:/usr/src/app/src \
	-v /vagrant/redef/patron-client2/test:/usr/src/app/test

.PHONY: test

lint:
	sudo docker run --rm $(HOST_VOLUME_BINDINGS) $(CONTAINER) npm run -s lint

test: lint
	sudo docker run --rm $(HOST_VOLUME_BINDINGS) $(CONTAINER) npm test

push:
ifndef TAG
	@echo "You must specify TAG when pushing"
	exit 1
endif
	sudo docker tag -f dockercompose_patron-client $(IMAGE):$(TAG)
	sudo docker push $(IMAGE):$(TAG)
