#!/bin/bash

KEYFILE=id_rsa

grep "ls.ext" /home/vagrant/.ssh/authorized_keys  >/dev/null 2>&1

if [ $? -eq 0 ]
then
    echo "ls.ext key found in authorized_keys"
else
    echo "adding ls.ext key to authorized_keys"
    cat /vagrant/ssh/$KEYFILE.pub >> /home/vagrant/.ssh/authorized_keys
fi
