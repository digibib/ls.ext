Bootstrapping salt master / minons
======

 This How-To explains how to "automate" install of Salt Master, Salt Minion and keys
 For proper functionality, installation of v2014.7 is recommended

## Install of salt master

(stable):
```ssh -t sudouser@master 'wget -O- --quiet https://bootstrap.saltstack.com | \
   sudo sh -s -- -M'```

(from git: v2014.1.10):
NB: If remote server has firewall preventing git port, it can be circumvented by adding the
`-g [git repo for salt]` flag to use https instead

```ssh -t sudouser@master 'wget -O- --quiet https://bootstrap.saltstack.com | \
   sudo sh -s -- -g https://github.com/saltstack/salt.git -M -N -P git v2014.1.10'```

Example: `ssh -t vagrant@192.168.50.21 'wget -O- --quiet https://bootstrap.saltstack.com | sudo sh -s -- -M -N'`

or: `vagrant ssh vm-devops -c 'wget -O- --quiet https://bootstrap.saltstack.com | sudo sh -s -- -M'`

## Install salt minion

1) install minion

```ssh -t sudouser@minion 'wget -O- --quiet https://bootstrap.saltstack.com | sudo sh -'```

Example: `ssh -t vagrant@192.168.50.12 'wget -O- --quiet https://bootstrap.saltstack.com | sudo sh -'`

or: `vagrant ssh vm-ship -c 'wget -O- --quiet https://bootstrap.saltstack.com | sudo sh -'`

2) add master to minion

add_master.py:

```cat add_master.py | ssh -t sudouser@minion 'MASTER_IP=[add master ip here] python --'```

Example: `cat add_master.py | ssh -t vagrant@192.168.50.12 'MASTER_IP=192.168.50.21 python--'`

or: `cat add_master.py | vagrant ssh vm-ship -c 'MASTER_IP=192.168.50.21 python --'`

3) remove any existing minion_master key

```ssh -t sudouser@minion 'sudo rm -rf /etc/salt/pki/minion/minion_master.pub'```

Example: `ssh -t vagrant@192.168.50.12 'sudo rm -rf /etc/salt/pki/minion/minion_master.pub'`

or: `vagrant ssh vm-ship -c 'sudo rm -rf /etc/salt/pki/minion/minion_master.pub'`

4) restart salt-minion

```ssh -t sudouser@minion 'sudo service salt-minion restart'```

Example: `ssh -t vagrant@192.168.50.12 'sudo service salt-minion restart'`

or: `vagrant ssh vm-ship -c 'sudo service salt-minion restart'`

## Accept minion keys on master

```ssh -t suduser@master 'sudo salt-key --accept-all --yes'```

Example: `ssh -t vagrant@192.168.50.21 'sudo salt-key --accept-all --yes'`

or: `vagrant ssh vm-devops -c 'sudo salt-key --accept-all --yes'`

## Test setup

```ssh -t sudouser@master 'sudo salt "*" test.ping'```

Example: `ssh -t vagrant@192.168.50.21  -c 'sudo salt "*" test.ping'`

or: `vagrant ssh vm-devops -c 'sudo salt "*" test.ping'`
