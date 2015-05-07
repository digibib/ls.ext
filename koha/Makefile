all: build run

IMAGE=digibib/redef-koha
CONTAINER=redef-koha
KOHA_URL=http://192.168.50.50:8082

KOHA_USER     ?= admin
KOHA_PASSWORD ?= secret

build:
	sudo docker build --tag $(IMAGE) --file="Dockerfile-skeleton" /vagrant/koha

stop:
	sudo docker stop $(CONTAINER) || true

rm: stop
	sudo docker rm $(CONTAINER) || true

run: build rm start_container wait_until_ready
	@echo "open $(KOHA_URL) for koha admin"
	@echo "\tlogin: $(KOHA_USER)"
	@echo "\tpass:  $(KOHA_PASSWORD)"

start_container:
	sudo docker run -d -p 8082:8081 -e "KOHA_URL=$(KOHA_URL)" --name $(CONTAINER) $(IMAGE)

wait_until_ready:
	sudo docker exec $(CONTAINER) /koha/wait_until_ready.py

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
	sudo docker push $(IMAGE)
