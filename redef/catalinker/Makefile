all: build test run

CLIENTTOOL_IMAGE=digibib/redef-catalinker-client-tools
SKELETON_IMAGE=digibib/redef-catalinker-skeleton
CONTAINER=redef_catalinker_skeleton_container
IMAGE=digibib/redef-catalinker

build-clienttools:
	sudo docker build --tag $(CLIENTTOOL_IMAGE) --file="/vagrant/redef/catalinker/client/Dockerfile-clienttools" /vagrant/redef/catalinker/client

test-client-dev: build-clienttools
	sudo docker run --rm -v /vagrant/redef/catalinker/client:/usr/src/app $(CLIENTTOOL_IMAGE) karma start karma.config.js

lint-client: build-clienttools
	sudo docker run --rm -v /vagrant/redef/catalinker/client:/usr/src/app $(CLIENTTOOL_IMAGE) jscs . --fix
	sudo docker run --rm -v /vagrant/redef/catalinker/client:/usr/src/app $(CLIENTTOOL_IMAGE) jshint --exclude app/ractive.min.js .

test-client: build-clienttools lint-client
	sudo docker run --rm -v /vagrant/redef/catalinker/client:/usr/src/app $(CLIENTTOOL_IMAGE) karma start karma.config.js --single-run
	sudo docker run --rm -v /vagrant/redef/catalinker/client:/usr/src/app $(CLIENTTOOL_IMAGE) node test/module-test/run.js

build-client: test-client
	sudo salt-call --local state.sls redef.catalinker.clientbuild

build: build-client
	sudo salt-call --local state.sls redef.catalinker.skeletonbuild

test: build
	sudo docker run --rm -v /vagrant/redef/catalinker/server:/usr/src/app $(SKELETON_IMAGE) rake test

run-dev: build-client stop
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
