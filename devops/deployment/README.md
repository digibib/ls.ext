Bootstrapping salt master / minons
======

 This How-To explains how to "automate" install of Salt Master, Salt Minion and keys

 See Makefile for how to do this bootstrapping on the development vm's.

``` 
****************        LS.ext DEVOPS Makefile      ************************
 
help:                   Show this help.
 
 
*******                      DEPLOYING                         *************
 
------- DEV - tasks:                                           -------------
dev_highstate:          Deploy current to your own local environment (vm-devops / vm-ship)
 
------- PROD - tasks:                                          -------------
prod_highstate:         Deploy specified version to production - args: SUDOUSER, MASTER, GITREF
prod_revision:          Shows the currently checked out revision on MASTER - args: SUDOUSER, MASTER
 
*******                     MIGRATING                          *************
 
------- DEV - tasks:                                           -------------
dev_get_dumps:          Downloads data dumps from wombat - args: WOMBATUSER
dev_import_patrons:     Runs conversion and import of patrons 
 
------- PROD - tasks:                                          -------------
prod_get_dumps:  Downloads data dumps from wombat -args:  WOMBATUSER, SUDOUSER, MINION
prod_import_patrons:  Runs conversion and import of patrons - args: SUDOUSER, MASTER, MINIONNAME
 
 
*******                 TROUBLESHOOTING                        *************
 
------- DEV - tasks:                                           -------------
dev_ping_all:           Ping all *connected* salt minions
dev_restart_minion:     Restart minion - args: MINIONNAME 
 
------- PROD - tasks:                                          -------------
prod_ping_all:          Ping all *connected* salt minions - args: SUDOUSER, MASTER
prod_restart_minion:    Ping all *connected* salt minions - args:  SUDOUSER, MINION
prod_master_log:        Tail -f on master log - args:  SUDOUSER, MASTER
prod_minion_log:        Tail -f on minion log - args: SUDOUSER, MINION
prod_command:           Issues salt-command to ALL minions - args:  SUDOUSER, MASTER, CMD
prod_deploy_log:        - args:  SUDOUSER, MASTER
 
 
*******          BOOTSTRAPPING -- installing SALTSTACK --      *************
 
------- DEV - tasks:                                           -------------
dev_bootstrap:          Install salt-master+minion on vm-devops and minion on vm-ship
 
------- PROD - tasks:                                          -------------
prod_bootstrap_master:  Install salt-master with ls.ext salt states and pillar data  - args: SUDOUSER, MASTER
prod_bootstrap_minion:  You need to specify SUDOUSER, MASTER, MINION, MASTER_IP
 	
```

Current deployment: ![Deployment illustration](deployment.png?raw=true "Deployment")

