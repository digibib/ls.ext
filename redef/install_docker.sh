#!/bin/bash
if hash docker 2>/dev/null; then
	echo "Docker already installed.";
else
  echo "Installing docker ..."
  sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys 36A1D7869245C8950F966E92D8576A8BA88D21E9
  sudo sh -c "echo deb https://get.docker.com/ubuntu docker main" > /etc/apt/sources.list.d/docker.list
  sudo apt-get update --quiet
  sudo apt-get install  --quiet --assume-yes linux-image-extra-$(uname -r) lxc-docker
  sudo echo 'DOCKER_OPTS="--storage-driver=aufs"' >> /etc/default/docker
  sudo service docker restart
  echo "Docker installed."
fi
