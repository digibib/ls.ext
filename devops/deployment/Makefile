help:                                                 ## Show this help.
	@fgrep -h "##" $(MAKEFILE_LIST) | fgrep -v fgrep | sed -e 's/\\$$//' | sed -e 's/##//'

dev_bootstrap: ## 
	vagrant ssh vm-devops -c 'wget -O- --quiet https://bootstrap.saltstack.com | sudo sh -s -- -g https://github.com/saltstack/salt.git -M git v2014.1.10'
	vagrant ssh vm-ship -c 'wget -O- --quiet https://bootstrap.saltstack.com | sudo sh -s -- -g https://github.com/saltstack/salt.git git v2014.1.10'
	cat add_master.py | vagrant ssh vm-ship -c 'MASTER_IP=192.168.50.21 python --'
	vagrant ssh vm-ship -c 'sudo rm -rf /etc/salt/pki/minion/minion_master.pub'
	vagrant ssh vm-ship -c 'sudo service salt-minion restart'
	vagrant ssh vm-devops -c 'sudo salt-key --accept-all --yes'

dev_ping_all: ##
	vagrant ssh vm-devops -c 'sudo salt "*" test.ping'

dev_restart_minion: ## You need to specify MINIONNAME
	vagrant ssh $(MINIONNAME) -c 'sudo service salt-minion restart'

dev_highstate: ##
	vagrant ssh vm-devops -c 'echo " ================ deploying =====================" >> deploy.log && sudo salt "*" state.highstate 2>&1 | sudo tee -a deploy.log'

prod_bootstrap_master: ## You need to specify SUDOUSER, MASTER
	ssh -t $(SUDOUSER)@$(MASTER) 'wget -O- --quiet https://bootstrap.saltstack.com/develop | sudo sh -s --'
	ssh -t $(SUDOUSER)@$(MASTER) '[ -d /var/lib/salt-master ] || sudo git clone https://github.com/digibib/ls.ext.git /var/lib/salt-master'
	ssh -t $(SUDOUSER)@$(MASTER) '[ -d /srv/salt ] || sudo ln -s /var/lib/salt-master/salt /srv'
	ssh -t $(SUDOUSER)@$(MASTER) '[ -d /srv/pillar ] || sudo ln -s /var/lib/salt-master/pillar /srv'

prod_bootstrap_minion: ## You need to specify SUDOUSER, MASTER, MINION, MASTER_IP
	ssh -t $(SUDOUSER)@$(MINION) 'wget -O- --quiet https://bootstrap.saltstack.com | sudo sh -s -- -g https://github.com/saltstack/salt.git git v2014.1.10'
	scp add_master.py $(SUDOUSER)@$(MINION):adduser.py
	ssh -t $(SUDOUSER)@$(MINION) 'sudo MASTER_IP=$(MASTER_IP) python adduser.py'
	ssh -t $(SUDOUSER)@$(MINION) 'sudo rm -rf /etc/salt/pki/minion/minion_master.pub'
	ssh -t $(SUDOUSER)@$(MINION) 'sudo service salt-minion restart'
	ssh -t $(SUDOUSER)@$(MASTER) 'sudo salt-key --accept-all --yes'

prod_ping_all: ## You need to specify SUDOUSER, MASTER
	ssh -t $(SUDOUSER)@$(MASTER) 'sudo salt "*" test.ping'

prod_restart_minion: ## You need to specify SUDOUSER, MINION
	ssh -t $(SUDOUSER)@$(MINION) 'sudo service salt-minion restart'

prod_master_log: ## You need to specify SUDOUSER, MASTER
	ssh -t $(SUDOUSER)@$(MASTER) 'sudo tail -100f /var/log/salt/master'

prod_minion_log: ## You need to specify SUDOUSER, MINION
	ssh -t $(SUDOUSER)@$(MINION) 'sudo tail -100f /var/log/salt/minion'

prod_highstate: ## You need to specify SUDOUSER, MASTER, GITREF
	ssh -t $(SUDOUSER)@$(MASTER) 'cd /var/lib/salt-master && sudo git checkout master && sudo git pull && sudo git checkout $(GITREF) 2>&1 | sudo tee -a deploy.log && sudo echo "======================== $(SUDOUSER) : deploying ref $(GITREF)" | sudo tee -a deploy.log && sudo date | sudo tee -a deploy.log && sudo salt "*" --log-level info --log-file-level=debug state.highstate 2>&1 | sudo tee -a deploy.log'

prod_command: ## You need to specify SUDOUSER, MASTER, CMD
	ssh -t $(SUDOUSER)@$(MASTER) 'sudo salt "*" $(CMD)'

prod_deploy_log: ## You need to specify SUDOUSER, MASTER
	ssh -t $(SUDOUSER)@$(MASTER) 'cd /var/lib/salt-master && cat deploy.log'

dev_install_migration: ## You need to specify DOCKERHUBPWD
	vagrant ssh vm-devops -c 'sudo salt "vm-ship" --log-level info state.sls migration.installed pillar="{deichman-at-docker-hub-password: $(DOCKERHUBPWD)}"'

prod_install_migration: ## You need to specify SUDOUSER, MASTER, MINIONNAME, DOCKERHUBPWD
	ssh -t $(SUDOUSER)@$(MASTER) 'sudo salt "$(MINIONNAME)" --log-level info state.sls migration.installed pillar="{deichman-at-docker-hub-password: $(DOCKERHUBPWD)}"'

dev_get_dumps: ## You need to specify WOMBATUSER
	vagrant ssh vm-ship -c 'mkdir -p data'
	vagrant ssh vm-ship -c 'scp $(WOMBATUSER)@10.172.2.160:/data/bibliofildumps/* /home/vagrant/bibliofildumps/'

# This could be done simpler as data is going from and to wombat, but this solves the general case where minion is unknown
prod_get_dumps: ## You need to specify WOMBATUSER, SUDOUSER, MINION
	ssh -t $(SUDOUSER)@$(MINION) 'mkdir -p data'
	ssh -t $(SUDOUSER)@$(MINION) 'scp $(WOMBATUSER)@10.172.2.160:/data/bibliofildumps/* /data/workdir/'

dev_import_patrons: ## 
	vagrant ssh vm-devops -c 'sudo salt "vm-ship" --log-level info state.sls migration.patrons_imported pillar="{migration-data-folder: /home/vagrant/bibilofildumps}"'

prod_import_patrons: ## SUDOUSER, MASTER, MINIONNAME
	ssh -t $(SUDOUSER)@$(MASTER) 'sudo salt "$(MINIONNAME)" --log-level info state.sls migration.patrons_imported pillar="{migration-data-folder: /data/workdir}"'
