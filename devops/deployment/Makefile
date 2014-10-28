## 
## 
##****************        LS.ext DEVOPS Makefile      ************************
## 

help:                  ## Show this help.
	@fgrep -h "##" $(MAKEFILE_LIST) | fgrep -v fgrep | sed -e 's/\\$$//' | sed -e 's/##//'

## 
## 
##*******                      DEPLOYING                         *************

## 
##------- DEV - tasks:                                           -------------

dev_highstate:         ## Deploy current to your own local environment (vm-devops / vm-ship)
	vagrant ssh vm-devops -c 'echo " ================ deploying =====================" >> deploy.log && sudo salt "*" state.highstate 2>&1 | sudo tee -a deploy.log'

## 
##------- PROD - tasks:                                          -------------

prod_highstate:        ## Deploy specified version to production - args: SUDOUSER, MASTER, GITREF
	ssh -t $(SUDOUSER)@$(MASTER) 'cd /var/lib/salt-master && sudo git checkout master && sudo git pull && sudo git checkout $(GITREF) 2>&1 | sudo tee -a deploy.log && sudo echo "======================== $(SUDOUSER) : deploying ref $(GITREF)" | sudo tee -a deploy.log && sudo date | sudo tee -a deploy.log && sudo salt "*" --log-level info --log-file-level=debug state.highstate 2>&1 | sudo tee -a deploy.log'

## 
## 
##*******                     MIGRATING                          *************

## 
##------- DEV - tasks:                                           -------------

dev_install_migration: ## Installs migration in vm-ship - args:  DOCKERHUBPWD
	vagrant ssh vm-devops -c 'sudo salt "vm-ship" --log-level info state.sls migration.installed pillar="{deichman-at-docker-hub-password: $(DOCKERHUBPWD)}"'

dev_get_dumps:         ## Downloads data dumps from wombat - args: WOMBATUSER
	vagrant ssh vm-ship -c 'mkdir -p /home/vagrant/bibliofildumps/'
	vagrant ssh vm-ship -c 'scp $(WOMBATUSER)@10.172.2.160:/data/bibliofildumps/* /home/vagrant/bibliofildumps/'

dev_import_patrons:    ## Runs conversion and import of patrons 
	vagrant ssh vm-devops -c 'sudo salt "vm-ship" --log-level info state.sls migration.patrons_imported pillar="{migration-data-folder: /home/vagrant/bibilofildumps}"'

## 
##------- PROD - tasks:                                          -------------

# This could be done simpler as data is going from and to wombat, but this solves the general case where minion is unknown
prod_install_migration: ## Installs migration in MININONAME - args:  SUDOUSER, MASTER, MINIONNAME, DOCKERHUBPWD
	ssh -t $(SUDOUSER)@$(MASTER) 'sudo salt "$(MINIONNAME)" --log-level debug state.sls migration.installed pillar="{deichman-at-docker-hub-password: $(DOCKERHUBPWD)}" | sudo tee -a deploy.log'

prod_get_dumps: ## Downloads data dumps from wombat -args:  WOMBATUSER, SUDOUSER, MINION
	ssh -t $(SUDOUSER)@$(MINION) 'sudo mkdir -p /data/workdir'
	ssh -t $(SUDOUSER)@$(MINION) 'sudo scp $(WOMBATUSER)@10.172.2.160:/data/bibliofildumps/* /data/workdir/ | sudo tee -a deploy.log'

prod_import_patrons: ## Runs conversion and import of patrons - args: SUDOUSER, MASTER, MINIONNAME
	ssh -t $(SUDOUSER)@$(MASTER) 'sudo salt "$(MINIONNAME)" --log-level debug state.sls migration.patrons_imported pillar="{migration-data-folder: /data/workdir}" | sudo tee -a deploy.log'

## 
## 
##*******                 TROUBLESHOOTING                        *************

## 
##------- DEV - tasks:                                           -------------

dev_ping_all:          ## Ping all *connected* salt minions
	vagrant ssh vm-devops -c 'sudo salt "*" test.ping'

dev_restart_minion:    ## Restart minion - args: MINIONNAME 
	vagrant ssh $(MINIONNAME) -c 'sudo service salt-minion restart'

## 
##------- PROD - tasks:                                          -------------

prod_ping_all:         ## Ping all *connected* salt minions - args: SUDOUSER, MASTER
	ssh -t $(SUDOUSER)@$(MASTER) 'sudo salt "*" test.ping'

prod_restart_minion:   ## Ping all *connected* salt minions - args:  SUDOUSER, MINION
	ssh -t $(SUDOUSER)@$(MINION) 'sudo service salt-minion restart'

prod_master_log:       ## Tail -f on master log - args:  SUDOUSER, MASTER
	ssh -t $(SUDOUSER)@$(MASTER) 'sudo tail -100f /var/log/salt/master'

prod_minion_log:       ## Tail -f on minion log - args: SUDOUSER, MINION
	ssh -t $(SUDOUSER)@$(MINION) 'sudo tail -100f /var/log/salt/minion'

prod_command:          ## Issues salt-command to ALL minions - args:  SUDOUSER, MASTER, CMD
	ssh -t $(SUDOUSER)@$(MASTER) 'sudo salt "*" $(CMD)'

prod_deploy_log:       ##
- args:  SUDOUSER, MASTER
	ssh -t $(SUDOUSER)@$(MASTER) 'cd /var/lib/salt-master && cat deploy.log'

## 
## 
##*******          BOOTSTRAPPING -- installing SALTSTACK --      *************

## 
##------- DEV - tasks:                                           -------------

dev_bootstrap:         ## Install salt-master+minion on vm-devops and minion on vm-ship
	vagrant ssh vm-devops -c 'wget -O- --quiet https://bootstrap.saltstack.com | sudo sh -s -- -g https://github.com/saltstack/salt.git -M git v2014.1.10'
	vagrant ssh vm-ship -c 'wget -O- --quiet https://bootstrap.saltstack.com | sudo sh -s -- -g https://github.com/saltstack/salt.git git v2014.1.10'
	cat add_master.py | vagrant ssh vm-ship -c 'MASTER_IP=192.168.50.21 python --'
	vagrant ssh vm-ship -c 'sudo rm -rf /etc/salt/pki/minion/minion_master.pub'
	vagrant ssh vm-ship -c 'sudo service salt-minion restart'
	vagrant ssh vm-devops -c 'sudo salt-key --accept-all --yes'

## 
##------- PROD - tasks:                                          -------------

prod_bootstrap_master: ## Install salt-master with ls.ext salt states and pillar data  - args: SUDOUSER, MASTER
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
## 	