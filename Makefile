all: up provision test run

up:
	vagrant up

provision:
	vagrant provision

run: run-services run-patron-client

run-patron-client:
	vagrant ssh -c 'cd /vagrant/patron-client && make run'
	echo "open http://192.168.50.50:8000/ for patron-client service in PROD mode"

run-dev: up run-services
	echo "open http://192.168.50.50:8000/ for patron-client service in DEV mode"
	vagrant ssh -c 'cd /vagrant/patron-client && make run-dev'

test: test-patron-client test-services

test-patron-client:
	vagrant ssh -c 'cd /vagrant/services && make stop || true'
	vagrant ssh -c 'cd /vagrant/patron-client && make lint test module-test'	

test-services:
	vagrant ssh -c 'cd /vagrant/services && make test'

log-f:
	vagrant ssh -c 'cd /vagrant/patron-client && make log-f'

inspect-patron-client:
	vagrant ssh -c 'cd /vagrant/patron-client && make inspect'

inspect-services:
	vagrant ssh -c 'cd /vagrant/services && make inspect'

run-services:
	vagrant ssh -c 'cd /vagrant/services && make'
	echo "open http://192.168.50.50:8080/ for services service in PROD mode"

run-db:
	vagrant ssh -c 'cd /vagrant/services && make run-db'
	echo "open http://192.168.50.50:3030/ for services db in PROD mode"


stop-services:
	vagrant ssh -c 'cd /vagrant/services && make stop'
	echo "stopping http://192.168.50.50:8080/ services"

stop-db:
	vagrant ssh -c 'cd /vagrant/services && make stop-db'
	echo "stopping http://192.168.50.50:3030/ services db"

halt:
	vagrant halt

login: # needs EMAIL, PASSWORD, USER
	@ vagrant ssh -c 'sudo docker login --email=$(EMAIL) --username=$(USER) --password=$(PASSWORD)'

TAG = "$(shell git rev-parse HEAD)"
push:
	vagrant ssh -c 'cd /vagrant/patron-client && make push TAG=$(TAG)'
	vagrant ssh -c 'cd /vagrant/services && make push TAG=$(TAG)'
