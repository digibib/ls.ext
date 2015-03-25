#!/bin/bash

KEYFILE=id_rsa

if [ -e ".ssh/$KEYFILE" ]
then
    echo "$KEYFILE in place"
else
    echo "copying keyfile"
    cp /vagrant/ssh/id_rsa.pub /home/vagrant/.ssh/
    chown vagrant:vagrant /home/vagrant/.ssh/id_rsa.pub
    cp /vagrant/ssh/id_rsa /home/vagrant/.ssh/
    chown vagrant:vagrant /home/vagrant/.ssh/id_rsa
fi
