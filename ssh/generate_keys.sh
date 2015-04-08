#!/bin/bash

# Vagrant 1.7 no longer operates with a well know keypair so we generate our own.
KEYFILE=id_rsa

DIR=$(cd `dirname "${BASH_SOURCE[0]}"` && pwd)

if [ -e "$DIR/$KEYFILE" ]
then
    KEY=`cat $DIR/$KEYFILE.pub`
    echo "$KEYFILE exists: $KEY"
else
    ssh-keygen -C "ls.ext - ssh key pair" -t rsa -P "" -f $DIR/$KEYFILE
    KEY=`cat $DIR/$KEYFILE.pub`
    echo "generated key pair $KEYFILE: $KEY"
fi
