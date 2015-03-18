all: build run

IMAGE=digibib/redef-patron-client
CONTAINER=redef-patron-client
MODULE_TEST_CONTAINER=redef-patron-client-test-instance

build:
	sudo docker build --tag $(IMAGE) /vagrant/patron-client

stop:
	sudo docker stop $(CONTAINER) || true

stop-test-instance:
	sudo docker stop $(MODULE_TEST_CONTAINER) || true

rm: stop
	sudo docker rm $(CONTAINER) || true

rm-test-instance: stop-test-instance 
	sudo docker rm $(MODULE_TEST_CONTAINER) || true

run: build rm
	sudo docker run -d -p 8000:8000 --name $(CONTAINER) $(IMAGE)

run-test-instance: build rm-test-instance
	sudo docker run -d -p 7000:8000 --name $(MODULE_TEST_CONTAINER) $(IMAGE)

lint: build
	sudo docker run --rm $(IMAGE) jslint *.js **/*.js

test: build
	sudo docker run --rm $(IMAGE) npm test

module-test: build run-test-instance
	sudo docker run --rm $(IMAGE) npm run-script module-test

run-dev: build rm
	sudo docker run -it -v /vagrant/patron-client:/usr/src/myapp -w /usr/src/myapp -p 8000:8000 --name $(CONTAINER) $(IMAGE) npm run-script start-dev

run-dev-debug: build rm
	sudo docker run -it -v /vagrant/patron-client:/usr/src/myapp -w /usr/src/myapp -p 8000:8000 --name $(CONTAINER) $(IMAGE) npm run-script start-dev-debug

test-debug: build
	sudo docker run -it --rm $(IMAGE) npm run-script test-debug

module-test-debug: build run-test-instance
	sudo docker run -it --rm $(IMAGE) npm run-script module-test-debug

log-f:
	sudo docker logs -f $(CONTAINER)

inspect:
	sudo docker exec -it $(CONTAINER) /bin/bash
