all: build run

build:
	mvn clean install
	sudo docker build --tag redef-services /vagrant/services

stop:
	sudo docker stop redef-services || true

rm: stop
	sudo docker rm redef-services || true

run: build rm
	sudo docker run -d -p 8080:8080 --name redef-services redef-services

test:
	mvn test

log-f:
	sudo docker logs -f redef-services

inspect:
	sudo docker exec -it redef-services /bin/bash
