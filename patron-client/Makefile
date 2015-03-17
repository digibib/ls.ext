all: build run

build:
	sudo docker build --tag redef-patron-client /vagrant/patron-client

stop:
	sudo docker stop redef-patron-client || true

stop-test-instance:
	sudo docker stop redef-patron-client-test-instance || true

rm: stop
	sudo docker rm redef-patron-client || true

rm-test-instance: stop-test-instance 
	sudo docker rm redef-patron-client-test-instance || true

run: build rm
	sudo docker run -d -p 8000:8000 --name redef-patron-client redef-patron-client

run-test-instance: build rm-test-instance
	sudo docker run -d -p 7000:8000 --name redef-patron-client-test-instance redef-patron-client

run: build rm
	sudo docker run -d -p 8000:8000 --name redef-patron-client redef-patron-client

lint: build
	sudo docker run --rm redef-patron-client jslint *.js **/*.js

test: build
	sudo docker run --rm redef-patron-client npm test

module-test: build run-test-instance
	sudo docker run --rm redef-patron-client npm run-script module-test

run-dev: build rm
	sudo docker run -it -v /vagrant/patron-client:/usr/src/myapp -w /usr/src/myapp -p 8000:8000 --name redef-patron-client redef-patron-client npm run-script start-dev

log-f:
	sudo docker logs -f redef-patron-client

inspect:
	sudo docker exec -it redef-patron-client /bin/bash
