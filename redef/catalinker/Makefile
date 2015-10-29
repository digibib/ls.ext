all: build test stop run

CLIENTTOOL_IMAGE=digibib/redef-catalinker-client-tools
SKELETON_IMAGE=digibib/redef-catalinker-skeleton
CONTAINER=redef_catalinker_skeleton_container
IMAGE=digibib/redef-catalinker
HOST_VOLUME_BINDINGS=-v /vagrant/redef/catalinker/client/src:/usr/src/app/src \
	-v /vagrant/redef/catalinker/client/test:/usr/src/app/test

build-clienttools:
	sudo docker build --tag $(CLIENTTOOL_IMAGE) --file="/vagrant/redef/catalinker/client/Dockerfile-clienttools" /vagrant/redef/catalinker/client

lint-client: build-clienttools
	sudo docker run --rm $(HOST_VOLUME_BINDINGS) $(CLIENTTOOL_IMAGE) npm run jscs src test module-test --fix
	sudo docker run --rm $(HOST_VOLUME_BINDINGS) $(CLIENTTOOL_IMAGE) npm run jshint src test module-test

test-client: lint-client
	sudo docker run --rm $(HOST_VOLUME_BINDINGS) $(CLIENTTOOL_IMAGE) npm run test

build: test-client
	sudo salt-call --local state.sls redef.catalinker.skeletonbuild

test: build test-server

test-server:
	sudo docker run --rm $(HOST_VOLUME_BINDINGS) $(SKELETON_IMAGE) rake test

run-dev: test-client stop
	sudo salt-call --local state.sls redef.catalinker.skeletonrun

test-server-dev:
	sudo docker run -it --rm $(HOST_VOLUME_BINDINGS) $(SKELETON_IMAGE) rake test

run:
	sudo salt-call --local state.sls redef.catalinker.builtrun

stop:
	sudo docker stop $(CONTAINER) || true

rm: stop
	sudo docker rm $(CONTAINER) || true

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
