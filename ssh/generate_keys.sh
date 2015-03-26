#!/bin/bash

# Vagrant 1.7 no longer operates with a well know keypair so we generate our own.
KEYFILE=id_rsa

if [ -e "$VAGRANT_ROOT/ssh/$KEYFILE" ]
then
    echo "$KEYFILE exists"
else
    echo "generating key pair $KEYFILE"
    ssh-keygen -C "ls.ext - ssh key pair" -t rsa -P "" -f $VAGRANT_ROOT/ssh/$KEYFILE
fi
