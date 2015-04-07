#!/bin/bash

KEYFILE=id_rsa

KEY=`cat /vagrant/ssh/$KEYFILE.pub`

echo "copying keyfile: $KEY"
cp /vagrant/ssh/id_rsa.pub /home/vagrant/.ssh/
chown vagrant:vagrant /home/vagrant/.ssh/id_rsa.pub
cp /vagrant/ssh/id_rsa /home/vagrant/.ssh/
chown vagrant:vagrant /home/vagrant/.ssh/id_rsa
