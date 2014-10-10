bootstrap_vms:
	vagrant ssh vm-devops -c 'wget -O- --quiet https://bootstrap.saltstack.com | sudo sh -s -- -g https://github.com/saltstack/salt.git -M git v2014.1.10'
	vagrant ssh vm-ship -c 'wget -O- --quiet https://bootstrap.saltstack.com | sudo sh -s -- -g https://github.com/saltstack/salt.git git v2014.1.10'
	cat add_master.py | vagrant ssh vm-ship -c 'MASTER_IP=192.168.50.21 python --'
	vagrant ssh vm-ship -c 'sudo rm -rf /etc/salt/pki/minion/minion_master.pub'
	vagrant ssh vm-ship -c 'sudo service salt-minion restart'
	vagrant ssh vm-devops -c 'sudo salt-key --accept-all --yes'
	vagrant ssh vm-devops -c 'sudo salt "*" test.ping'

bootstrap_prod: # You need to specify SUDOUSER, MASTER, MINION, MASTER_IP
	ssh -t $(SUDOUSER)@$(MASTER) 'wget -O- --quiet https://bootstrap.saltstack.com/develop | sudo sh -s --'
	ssh -t $(SUDOUSER)@$(MINION) 'wget -O- --quiet https://bootstrap.saltstack.com | sudo sh -s -- -g https://github.com/saltstack/salt.git git v2014.1.10'
	scp add_master.py $(SUDOUSER)@$(MINION):adduser.py
	ssh -t $(SUDOUSER)@$(MINION) 'sudo MASTER_IP=$(MASTER_IP) python adduser.py'
	ssh -t $(SUDOUSER)@$(MINION) 'sudo rm -rf /etc/salt/pki/minion/minion_master.pub'
	ssh -t $(SUDOUSER)@$(MINION) 'sudo service salt-minion restart'
	ssh -t $(SUDOUSER)@$(MASTER) 'sudo salt-key --accept-all --yes'
	ssh -t $(SUDOUSER)@$(MASTER) 'sudo salt "*" test.ping'
