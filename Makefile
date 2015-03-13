all: run

up:
	vagrant up

run: up
	vagrant ssh -c 'cd /vagrant/patron-client && make run'
	echo "open http://192.168.50.50:8000/ for server in PROD mode"

run-dev: up
	echo "open http://192.168.50.50:8000/ for server in DEV mode"
	vagrant ssh -c 'cd /vagrant/patron-client && make run-dev'

log-f:
	vagrant ssh -c 'cd /vagrant/patron-client && make log-f'

inspect-patron-client:
	vagrant ssh -c 'cd /vagrant/patron-client && make inspect'
