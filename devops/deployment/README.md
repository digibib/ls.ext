Bootstrapping salt master / minons
======

 This How-To explains how to "automate" install of Salt Master, Salt Minion and keys
 Currently we use 2014.1.10 (last stable version without bad bugs)

 See Makefile for how to do this bootstrapping on the development vm's.

## Install of salt master

(stable):
```ssh -t sudouser@master 'wget -O- --quiet https://bootstrap.saltstack.com | \
   sudo sh -s -- -M -N'```

(from git: v2014.1.10):
NB: If remote server has firewall preventing git port, it can be circumvented by adding the
`-g [git repo for salt]` flag to use https instead

```ssh -t sudouser@master 'wget -O- --quiet https://bootstrap.saltstack.com | \
   sudo sh -s -- -g https://github.com/saltstack/salt.git -M -N git v2014.1.10'```

## Install salt minion

1) install minion

```ssh -t sudouser@minion 'wget -O- --quiet https://bootstrap.saltstack.com | sudo sh -'```

2) add master to minion

add_master.py:

```cat add_master.py | ssh -t sudouser@minion 'MASTER_IP=[add master ip here] python --'```

3) remove any existing minion_master key

```ssh -t sudouser@minion 'sudo rm -rf /etc/salt/pki/minion/minion_master.pub'```

4) restart salt-minion

```ssh -t sudouser@minion 'sudo service salt-minion restart'```

## Accept minion keys on master

```ssh -t suduser@master 'sudo salt-key --accept-all --yes'```

## Test setup

```ssh -t sudouser@master 'sudo salt "*" test.ping'```
