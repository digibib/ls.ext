all: build test run

CLIENTBUILDER_IMAGE=digibib/redef-catalinker-client-builder
SKELETON_IMAGE=digibib/redef-catalinker-skeleton
CONTAINER=redef_catalinker_skeleton_container
IMAGE=digibib/redef-catalinker

dev_client: build_clientbuilder
	sudo docker run --rm -v /vagrant/redef/catalinker/client:/usr/src/app $(CLIENTBUILDER_IMAGE) karma start karma.config.js

build_client: test_client
	cp client/app/lib.js server/lib/public/lib.js

lint_client: build_clientbuilder
	sudo docker run --rm -v /vagrant/redef/catalinker/client:/usr/src/app $(CLIENTBUILDER_IMAGE) jscs . --fix
	sudo docker run --rm -v /vagrant/redef/catalinker/client:/usr/src/app $(CLIENTBUILDER_IMAGE) jshint .

test_client: build_clientbuilder lint_client
	sudo docker run --rm -v /vagrant/redef/catalinker/client:/usr/src/app $(CLIENTBUILDER_IMAGE) karma start karma.config.js --single-run

build_clientbuilder:
	sudo docker build --tag $(CLIENTBUILDER_IMAGE) --file="/vagrant/redef/catalinker/client/Dockerfile-clientbuilder" /vagrant/redef/catalinker/client

build:
	sudo salt-call --local state.sls redef.catalinker.skeletonbuild

test: test_client build
	sudo docker run --rm -v /vagrant/redef/catalinker/server:/usr/src/app $(SKELETON_IMAGE) rake test

run-dev:
	sudo salt-call --local state.sls redef.catalinker.skeletonrun

test-dev: build
	sudo docker run -it --rm -v /vagrant/redef/catalinker/server:/usr/src/app $(SKELETON_IMAGE) rake test

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
