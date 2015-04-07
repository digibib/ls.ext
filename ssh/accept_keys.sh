#!/bin/bash

KEYFILE=id_rsa

KEY=`cat /vagrant/ssh/$KEYFILE.pub`

grep "$KEY" /home/vagrant/.ssh/authorized_keys  >/dev/null 2>&1

if [ $? -eq 0 ]
then
    echo "ls.ext key found in authorized_keys: $KEY"
else
    echo "adding ls.ext key to authorized_keys: $KEY"
    cat /vagrant/ssh/$KEYFILE.pub >> /home/vagrant/.ssh/authorized_keys
fi
