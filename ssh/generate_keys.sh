#!/bin/bash

# Vagrant 1.7 no longer operates with a well know keypair so we generate our own.
KEYFILE=id_rsa

if [ -e "$VAGRANT_ROOT/ssh/$KEYFILE" ]
then
    KEY=`cat $VAGRANT_ROOT/ssh/$KEYFILE.pub`
    echo "$KEYFILE exists: $KEY"
else
    ssh-keygen -C "ls.ext - ssh key pair" -t rsa -P "" -f $VAGRANT_ROOT/ssh/$KEYFILE
    KEY=`cat $VAGRANT_ROOT/ssh/$KEYFILE.pub`
    echo "generated key pair $KEYFILE: $KEY"
fi
