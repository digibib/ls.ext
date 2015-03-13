all: build run

build:
	sudo docker build --tag redef-patron-client /vagrant/patron-client

stop:
	sudo docker stop redef-patron-client || true

rm: stop
	sudo docker rm redef-patron-client || true

run: build rm
	sudo docker run -d -p 8000:8000 --name redef-patron-client redef-patron-client

run-dev: build rm
	sudo docker run -it -v /vagrant/patron-client:/usr/src/myapp -w /usr/src/myapp -p 8000:8000 --name redef-patron-client redef-patron-client nodemon

log-f:
	sudo docker logs -f redef-patron-client

inspect:
	sudo docker exec -it redef-patron-client /bin/bash
