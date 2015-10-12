SSH_OPTS=-o PreferredAuthentications="password" -t
## 
## 
##****************        LS.ext DEVOPS Makefile      ************************
## 

SALT_VERSION=2015.5.3+ds-1trusty1

help:                  ## Show this help.
	@fgrep -h "##" $(MAKEFILE_LIST) | fgrep -v fgrep | sed -e 's/\\$$//' | sed -e 's/##//'

## 
## 
##*******                      DEPLOYING                         *************

## 
##------- DEV - tasks:                                           -------------

ifdef LSDEVMODE
SHIP=$(LSDEVMODE)-ship
else
SHIP=vm-ship
endif

dev_highstate:         ## Deploy current to your own local environment (vm-devops / vm-ship)
	vagrant ssh vm-devops -c 'echo " ================ deploying =====================" >> deploy.log && sudo salt "*" state.highstate pillar="{'GITREF': 'latest'}" 2>&1 | sudo tee -a deploy.log'

dev_highstate_dry_run:         ## Dry run deployment to your own local environment (vm-devops / $(SHIP))
	vagrant ssh vm-devops -c 'sudo salt "*" state.highstate pillar="{'GITREF': 'latest'}" test=True'

##
##------- PROD - tasks:                                          -------------

prod_highstate:        ## Deploy specified version to production - args: SUDOUSER, MASTER, GITREF
	ssh $(SSH_OPTS) $(SUDOUSER)@$(MASTER) "sudo sh -c 'cd /var/lib/salt-master && git checkout master && git pull && git checkout $(GITREF) 2>&1 | tee -a deploy.log && echo \"======================== $(SUDOUSER) : deploying ref $(GITREF)\" | tee -a deploy.log && date | tee -a deploy.log && salt -t 30 \"*\" --log-level info --log-file-level=debug state.highstate pillar=\"{\"GITREF\": \"$(GITREF)\"}\" 2>&1 | tee -a deploy.log'"


prod_revision:         ## Shows the currently checked out revision on MASTER - args: SUDOUSER, MASTER
	ssh $(SSH_OPTS) $(SUDOUSER)@$(MASTER) 'cd /var/lib/salt-master && sudo git rev-parse HEAD'

prod_highstate_dry_run:        ## Dry run deployment of specified version to production - args: SUDOUSER, MASTER, GITREF
	ssh $(SSH_OPTS) $(SUDOUSER)@$(MASTER) "sudo sh -c 'cd /var/lib/salt-master && git checkout master && git pull && git checkout $(GITREF) && salt \"*\" --log-level info --log-file-level=debug state.highstate pillar=\"{\"GITREF\": \"$(GITREF)\"}\" test=True'"



##
##
##*******                     EXAMPLE DATA                       *************

##
##------- DEV - tasks:                                           -------------

dev_reset_db: ## Delete content from all relevant tables in koha
	vagrant ssh vm-devops -c 'sudo salt "$(SHIP)" --log-level info state.sls migration.reset pillar="{migration-data-folder: /var/migration_workdir}"'

dev_reset: dev_reset_db dev_reindex_koha

dev_clean_data: ## Delete previously extracted files and temporary files from workdir
	vagrant ssh vm-devops -c 'sudo salt "$(SHIP)" --log-level info state.sls migration.data_cleaned pillar="{migration-data-folder: /var/migration_workdir}"'

dev_copy_example_data_full: dev_clean_data ## Clean data, download configuration data and complete set of example data from wombat - args: WOMBATUSER
	vagrant ssh vm-devops -c 'sudo salt "$(SHIP)" --log-level info state.sls migration.copy_configuration_data pillar="{migration-data-folder: /var/migration_workdir}"'
	vagrant ssh $(SHIP) -c 'mkdir -p /var/migration_workdir'
	vagrant ssh $(SHIP) -c 'sudo scp $(WOMBATUSER)@10.172.2.160:/data/example_data_full/*.txt /var/migration_workdir'

dev_copy_example_data_minimum: dev_clean_data	## Clean data, download configuration data and minimal example data from migration image
	vagrant ssh vm-devops -c 'sudo salt "$(SHIP)" --log-level info state.sls migration.copy_configuration_data pillar="{migration-data-folder: /var/migration_workdir}"'
	vagrant ssh $(SHIP) -c 'sudo mkdir -p /var/migration_workdir/'
	vagrant ssh vm-devops -c 'sudo salt "$(SHIP)" --log-level info state.sls migration.copy_example_data pillar="{migration-data-folder: /var/migration_workdir}"'

dev_load_example_data:
	vagrant ssh vm-devops -c 'sudo salt "$(SHIP)" --log-level info state.sls migration.load_example_data pillar="{migration-data-folder: /var/migration_workdir}"'

dev_load_example_data_through_services:
	vagrant ssh vm-devops -c 'sudo salt "$(SHIP)" --log-level info state.sls migration.redef_load_example_data pillar="{migration-data-folder: /var/migration_workdir}"'

dev_create_works:	## Aggregates works from publications
	vagrant ssh vm-devops -c 'sudo salt "$(SHIP)" --log-level info state.sls migration.redef_sparql_aggregation pillar="{migration-data-folder: /var/migration_workdir}"'

dev_index_all_works:	## indexes all works in Elasticsearch
	vagrant ssh vm-devops -c 'sudo salt "$(SHIP)" --log-level info state.sls migration.redef_index_all_works pillar="{migration-data-folder: /var/migration_workdir}"'

dev_load_issuing_rules: ## Loads issuing rules
	vagrant ssh vm-devops -c 'sudo salt "$(SHIP)" --log-level info state.sls migration.issuing_rules_imported pillar="{migration-data-folder: /var/migration_workdir}"'

dev_load_authorised_values: ## Loads authorised values
	vagrant ssh vm-devops -c 'sudo salt "$(SHIP)" --log-level info state.sls migration.authorised_values_imported pillar="{migration-data-folder: /var/migration_workdir}"'

dev_load_branches: ## Loads data of type branches
	vagrant ssh vm-devops -c 'sudo salt "$(SHIP)" --log-level info state.sls migration.branches_imported pillar="{migration-data-folder: /var/migration_workdir}"'

dev_load_patrons:    ## Loads example data of type patrons and exemplar
	vagrant ssh vm-devops -c 'sudo salt "$(SHIP)" --log-level info state.sls migration.patrons_imported pillar="{migration-data-folder: /var/migration_workdir}"'

dev_load_material_type: ## Loads example data of type itemtypes from csv-file
	vagrant ssh vm-devops -c 'sudo salt "$(SHIP)" --log-level info state.sls migration.material_type_loaded pillar="{migration-data-folder: /var/migration_workdir}"'

dev_load_catalogue: ## Loads example data of type catalogue and exemplar
	vagrant ssh vm-devops -c 'sudo salt -t 30 "$(SHIP)" --log-level info state.sls migration.catalogue_loaded pillar="{migration-data-folder: /var/migration_workdir}"'

dev_load_loans: ## Loads example data of type loans
	vagrant ssh vm-devops -c 'sudo salt -t 30 "$(SHIP)" --log-level info state.sls migration.loans_loaded pillar="{migration-data-folder: /var/migration_workdir}"'

dev_load_reservations: ## Loads example data of type reservations
	vagrant ssh vm-devops -c 'sudo salt -t 30 "$(SHIP)" --log-level info state.sls migration.reservations_loaded pillar="{migration-data-folder: /var/migration_workdir}"'

dev_reindex_koha: ## Reindexes koha by building zebra
	vagrant ssh vm-devops -c 'sudo salt -t 30 "$(SHIP)" --log-level info state.sls koha.reindexed'
##
##------- PROD - tasks:                                          -------------

prod_reset_db: ## Delete content from all relevant tables in koha
	ssh $(SSH_OPTS) $(SUDOUSER)@$(MASTER) "sudo sh -c 'salt \"$(MINIONNAME)\" --log-level debug state.sls migration.reset pillar=\"{migration-data-folder: /var/migration_workdir}\" | tee -a deploy.log'"

prod_reset: prod_reset_db prod_reindex_koha

prod_clean_data: ## Delete previously extracted files and temporary files from workdir
	ssh $(SSH_OPTS) $(SUDOUSER)@$(MASTER) "sudo sh -c 'salt \"$(MINIONNAME)\" --log-level debug state.sls migration.data_cleaned pillar=\"{migration-data-folder: /var/migration_workdir}\" | tee -a deploy.log'"

prod_extract_example_data: prod_clean_data ## After cleaning previous files, downloads complete set of example data from wombat -args:  WOMBATUSER, SUDOUSER, MINION
	ssh $(SSH_OPTS) $(SUDOUSER)@$(MINION) 'sudo mkdir -p /var/migration_workdir'
	ssh $(SSH_OPTS) $(SUDOUSER)@$(MINION) "sudo sh -c 'scp $(WOMBATUSER)@10.172.2.160:/data/example_data_full/* /var/migration_workdir | tee -a deploy.log'"

prod_extract_example_data_minimum: prod_clean_data ## After cleaning previous files, downloads minimum set of example data from wombat - args: WOMBATUSER, SUDOUSER, MINION
	ssh $(SSH_OPTS) $(SUDOUSER)@$(MINION) 'sudo mkdir -p /var/migration_workdir/'
	ssh $(SSH_OPTS) $(SUDOUSER)@$(MINION) 'sudo scp $(WOMBATUSER)@10.172.2.160:/data/example_data_minimum/* /var/migration_workdir'

prod_load_example_data: ## Loads a complete set of example data - args: SUDOUSER, MASTER, MINIONNAME
	ssh $(SSH_OPTS) $(SUDOUSER)@$(MASTER) "sudo sh -c ' \
		salt \"$(MINIONNAME)\" --log-level debug state.sls migration.copy_configuration_data pillar=\"{migration-data-folder: /var/migration_workdir}\" | tee -a deploy.log && \
		salt \"$(MINIONNAME)\" --log-level debug state.sls migration.load_example_data pillar=\"{migration-data-folder: /var/migration_workdir}\" | tee -a deploy.log && \
		salt \"$(MINIONNAME)\" --log-level debug state.sls migration.notify_success_to_slack'"

prod_load_issuing_rules: ## Loads example data of type issuing-rules - args: SUDOUSER, MASTER, MINIONNAME
	ssh $(SSH_OPTS) $(SUDOUSER)@$(MASTER) "sudo sh -c 'salt \"$(MINIONNAME)\" --log-level debug state.sls migration.issuing_rules_imported pillar=\"{migration-data-folder: /var/migration_workdir}\" | tee -a deploy.log'"

prod_load_authorised_values: ## Loads example data of type authorised-values - args: SUDOUSER, MASTER, MINIONNAME
	ssh $(SSH_OPTS) $(SUDOUSER)@$(MASTER) "sudo sh -c 'salt \"$(MINIONNAME)\" --log-level debug state.sls migration.authorised_values_imported pillar=\"{migration-data-folder: /var/migration_workdir}\" | tee -a deploy.log'"

prod_load_patrons: ## Loads example data of type patrons - args: SUDOUSER, MASTER, MINIONNAME
	ssh $(SSH_OPTS) $(SUDOUSER)@$(MASTER) "sudo sh -c 'salt \"$(MINIONNAME)\" --log-level debug state.sls migration.patrons_imported pillar=\"{migration-data-folder: /var/migration_workdir}\" | tee -a deploy.log'"

prod_load_material_type: ## Loads example data of type itemtypes - args: SUDOUSER, MASTER, MINIONNAME
	ssh $(SSH_OPTS) $(SUDOUSER)@$(MASTER) "sudo sh -c 'salt \"$(MINIONNAME)\" --log-level debug state.sls migration.material_type_loaded pillar=\"{migration-data-folder: /var/migration_workdir}\" | tee -a deploy.log'"

prod_load_catalogue: ## Loads example data of type catalogue - args: SUDOUSER, MASTER, MINIONNAME
	ssh $(SSH_OPTS) $(SUDOUSER)@$(MASTER) "sudo sh -c 'salt \"$(MINIONNAME)\" --log-level debug state.sls migration.catalogue_loaded pillar=\"{migration-data-folder: /var/migration_workdir}\" | tee -a deploy.log'"

prod_load_loans: ## Loads example data of type loans - args: SUDOUSER, MASTER, MINIONNAME
	ssh $(SSH_OPTS) $(SUDOUSER)@$(MASTER) "sudo sh -c 'salt \"$(MINIONNAME)\" --log-level debug state.sls migration.loans_loaded pillar=\"{migration-data-folder: /var/migration_workdir}\" | tee -a deploy.log'"

prod_load_reservations: ## Loads example data of type reservations - args: SUDOUSER, MASTER, MINIONNAME
	ssh $(SSH_OPTS) $(SUDOUSER)@$(MASTER) "sudo sh -c 'salt \"$(MINIONNAME)\" --log-level debug state.sls migration.reservations_loaded pillar=\"{migration-data-folder: /var/migration_workdir}\" | tee -a deploy.log'"

prod_reindex_koha: ## Reindexes koha by building zebra
	ssh $(SSH_OPTS) $(SUDOUSER)@$(MASTER) "sudo sh -c 'salt \"$(MINIONNAME)\" --log-level debug state.sls koha.reindexed | tee -a deploy.log'"

prod_create_works:	## Aggregates works from publications - args: SUDOUSER, MASTER, MINIONNAME
	ssh $(SSH_OPTS) $(SUDOUSER)@$(MASTER) "sudo sh -c 'salt \"$(MINIONNAME)\" --log-level debug state.sls migration.redef_sparql_aggregation | tee -a deploy.log'"

prod_index_all_works:	## indexes all works in Elasticsearch - args: SUDOUSER, MASTER, MINIONNAME
	ssh $(SSH_OPTS) $(SUDOUSER)@$(MASTER) "sudo sh -c 'salt \"$(MINIONNAME)\" --log-level debug state.sls migration.redef_index_all_works | tee -a deploy.log'"

## 
## 
##*******                     MIGRATING                          *************

## 
##------- DEV - tasks:                                           -------------

dev_get_dumps:         ## Downloads data dumps from wombat - args: WOMBATUSER
	vagrant ssh $(SHIP) -c 'mkdir -p /var/migration_workdir'
	vagrant ssh $(SHIP) -c 'scp $(WOMBATUSER)@10.172.2.160:/data/bibliofildumps/* /var/migration_workdir/'

dev_import_patrons:    ## Runs conversion and import of patrons 
	vagrant ssh vm-devops -c 'sudo salt "$(SHIP)" --log-level info state.sls migration.patrons_imported pillar="{migration-data-folder: /var/migration_workdir}"'

## 
##------- PROD - tasks:                                          -------------

prod_get_dumps: ## Downloads data dumps from wombat -args:  WOMBATUSER, SUDOUSER, MINION
	ssh $(SSH_OPTS) $(SUDOUSER)@$(MINION) 'sudo mkdir -p /var/migration_workdir'
	ssh $(SSH_OPTS) $(SUDOUSER)@$(MINION) "sudo sh -c 'scp $(WOMBATUSER)@10.172.2.160:/data/bibliofildumps/* /var/migration_workdir/ | tee -a deploy.log'"

prod_import_patrons: ## Runs conversion and import of patrons - args: SUDOUSER, MASTER, MINIONNAME
	ssh $(SSH_OPTS) $(SUDOUSER)@$(MASTER) "sudo sh -c 'salt \"$(MINIONNAME)\" --log-level debug state.sls migration.patrons_imported pillar=\"{migration-data-folder: /var/migration_workdir}\" | tee -a deploy.log'"

## 
## 
##*******                 TROUBLESHOOTING                        *************

## 
##------- DEV - tasks:                                           -------------

dev_ping_all:          ## Ping all *connected* salt minions
	vagrant ssh vm-devops -c 'sudo salt -v "*" test.ping'

dev_restart_minion:    ## Restart minion - args: MINIONNAME 
	vagrant ssh $(MINIONNAME) -c 'sudo service salt-minion restart'

## 
##------- PROD - tasks:                                          -------------

prod_ping_all:         ## Ping all *connected* salt minions - args: SUDOUSER, MASTER
	ssh $(SSH_OPTS) $(SUDOUSER)@$(MASTER) 'sudo salt -t 30 -v "*" test.ping'

prod_restart_minion:   ## Ping all *connected* salt minions - args:  SUDOUSER, MINION
	ssh $(SSH_OPTS) $(SUDOUSER)@$(MINION) 'sudo service salt-minion restart'

prod_master_log:       ## Tail -f on master log - args:  SUDOUSER, MASTER
	ssh $(SSH_OPTS) $(SUDOUSER)@$(MASTER) 'sudo tail -100f /var/log/salt/master'

prod_minion_log:       ## Tail -f on minion log - args: SUDOUSER, MINION
	ssh $(SSH_OPTS) $(SUDOUSER)@$(MINION) 'sudo tail -100f /var/log/salt/minion'

prod_command:          ## Issues salt-command to ALL minions - args:  SUDOUSER, MASTER, CMD
	ssh $(SSH_OPTS) $(SUDOUSER)@$(MASTER) 'sudo salt "*" $(CMD)'

prod_deploy_log:       ## - args:  SUDOUSER, MASTER
	ssh $(SSH_OPTS) $(SUDOUSER)@$(MASTER) 'cd /var/lib/salt-master && cat deploy.log'

## 
## 
##*******          BOOTSTRAPPING -- installing SALTSTACK --      *************

## 
##------- DEV - tasks:                                           -------------

dev_upgrade_salt: ## Upgrade salt-master+minion on vm-devops and minion on $(SHIP)
	vagrant ssh vm-devops -c 'bash -c "sudo add-apt-repository -y ppa:saltstack/salt && \
		sudo apt-get update && \
		sudo apt-get install -y python-software-properties software-properties-common salt-master=$(SALT_VERSION) salt-minion=$(SALT_VERSION)"'
	vagrant ssh $(SHIP) -c 'bash -c "sudo add-apt-repository -y ppa:saltstack/salt && \
		sudo apt-get update && \
		sudo apt-get install -y python-software-properties software-properties-common salt-minion=$(SALT_VERSION)"'

dev_connect_minions: ## Adds and connect minion
	vagrant ssh $(SHIP) -c 'sudo service salt-minion stop || true'
	vagrant ssh $(SHIP) -c 'echo "master: 192.168.50.21" | sudo tee /etc/salt/minion > /dev/null'
	vagrant ssh $(SHIP) -c 'sudo rm -rf /etc/salt/pki/minion/minion_master.pub'
	vagrant ssh vm-devops -c 'sudo salt-key -d $(SHIP) --yes'
	vagrant ssh $(SHIP) -c 'sudo service salt-minion start'
	vagrant ssh vm-devops -c 'sudo salt-key --accept-all --yes'

dev_bootstrap: dev_upgrade_salt dev_connect_minions ## Install salt-master+minion on vm-devops and minion on $(SHIP)

## 
##------- PROD - tasks:                                          -------------

prod_upgrade_salt_master: ## Upgrade salt on master - args: SUDOUSER, MASTER
	ssh $(SSH_OPTS) $(SUDOUSER)@$(MASTER) 'bash -c "sudo add-apt-repository -y ppa:saltstack/salt && \
		sudo apt-get update && \
		sudo apt-get install -y python-software-properties software-properties-common salt-master=$(SALT_VERSION)"'

prod_upgrade_salt_minion: ## Upgrade salt on minion - args: SUDOUSER, MINION
	ssh $(SSH_OPTS) $(SUDOUSER)@$(MINION) 'bash -c "sudo add-apt-repository -y ppa:saltstack/salt && \
		sudo apt-get update && \
		sudo apt-get install -y python-software-properties software-properties-common salt-master=$(SALT_VERSION)"'

prod_bootstrap_master: prod_upgrade_salt_master ## Install salt-master with ls.ext salt states and pillar data  - args: SUDOUSER, MASTER
	ssh $(SSH_OPTS) $(SUDOUSER)@$(MASTER) '[ -d /var/lib/salt-master ] || sudo git clone https://github.com/digibib/ls.ext.git /var/lib/salt-master'
	ssh $(SSH_OPTS) $(SUDOUSER)@$(MASTER) '[ -d /srv/salt ] || sudo ln -s /var/lib/salt-master/salt /srv'
	ssh $(SSH_OPTS) $(SUDOUSER)@$(MASTER) '[ -d /srv/pillar ] || sudo ln -s /var/lib/salt-master/pillar /srv'

prod_connect_minion: ## Adds and connect minion, args: SUDOUSER, MASTER, MINION, MASTER_IP, MINION_NAME
	ssh $(SSH_OPTS) $(SUDOUSER)@$(MINION) 'sudo service salt-minion stop || true'
	ssh $(SSH_OPTS) $(SUDOUSER)@$(MINION) 'echo "master: $(MASTER_IP)" | sudo tee /etc/salt/minion > /dev/null'
	ssh $(SSH_OPTS) $(SUDOUSER)@$(MINION) 'sudo rm -rf /etc/salt/pki/minion/minion_master.pub'
	ssh $(SSH_OPTS) $(SUDOUSER)@$(MASTER) 'sudo salt-key -d $(MINION_NAME) --yes'
	ssh $(SSH_OPTS) $(SUDOUSER)@$(MINION) 'sudo service salt-minion start'
	ssh $(SSH_OPTS) $(SUDOUSER)@$(MASTER) 'sudo salt-key --accept-all --yes'

prod_bootstrap_minion: prod_upgrade_salt_minion prod_connect_minion ## Install salt-minion and add to master - args: SUDOUSER, MASTER, MINION, MASTER_IP, MINION_NAME
##
