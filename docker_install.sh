#!/bin/bash
VERSION=1.10.0-0~trusty
INSTALLED=`dpkg -l | grep docker-engine | awk '{print $3}'`
if [ $VERSION = $INSTALLED ] ; then
  echo "docker version $VERSION already installed";
else
  echo "Installing docker version $VERSION ...";
  sudo apt-get purge --assume-yes --quiet docker-engine >/dev/null 2>&1
  sudo apt-key adv --keyserver hkp://p80.pool.sks-keyservers.net:80 --recv-keys 58118E89F3A912897C070ADBF76221572C52609D
  echo "deb https://apt.dockerproject.org/repo ubuntu-trusty main" | sudo tee /etc/apt/sources.list.d/docker.list
  sudo apt-get update
  sudo apt-get -y install linux-image-extra-$(uname -r) make git $VERSION
  echo "docker installed."
fi
