all: build test run

SKELETON_IMAGE=digibib/redef-catalinker-skeleton
CONTAINER=redef_catalinker_skeleton_container
IMAGE=digibib/redef-catalinker

build:
	sudo salt-call --local state.sls redef.catalinker.skeletonbuild

test: build
	sudo docker run --rm -v /vagrant/redef/catalinker:/usr/src/app $(SKELETON_IMAGE) rake test

test-dev: build
	sudo docker run -it --rm -v /vagrant/redef/catalinker:/usr/src/app $(SKELETON_IMAGE) rake test

run: rm
	sudo salt-call --local state.sls redef.catalinker.skeletonrun

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
