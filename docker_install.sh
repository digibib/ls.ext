#!/bin/bash
dpkg -l docker-engine >/dev/null 2>&1
if [ $? -eq 0 ] ; then
  echo "docker installed, removing ...";
  sudo apt-get purge --assume-yes --quiet docker-engine
fi

sudo docker version --format '{{.Server.Version}}' >/dev/null 2>&1
if [ $? -eq 0 ] ; then
    echo "docker already installed and presumably working."
else
  echo "Installing docker...";
  sudo apt-key adv --keyserver hkp://p80.pool.sks-keyservers.net:80 --recv-keys 58118E89F3A912897C070ADBF76221572C52609D
  echo "deb https://apt.dockerproject.org/repo ubuntu-trusty main" | sudo tee /etc/apt/sources.list.d/docker.list
  sudo apt-get update
  sudo apt-get -y install linux-image-extra-$(uname -r) make git docker-engine
  echo "docker installed."
fi
