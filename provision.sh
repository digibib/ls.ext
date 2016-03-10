#!/bin/bash

echo -e "1) Installing Docker\n"
VERSION="1.10.0-0~$(lsb_release -c -s)"
INSTALLED=`dpkg -l | grep docker-engine | awk '{print $3}'`
if [ $VERSION = $INSTALLED ] ; then
  echo "docker version $VERSION already installed";
else
  echo "Installing docker version $VERSION ...";
  sudo apt-get purge --assume-yes --quiet docker-engine >/dev/null 2>&1
  sudo apt-key adv --keyserver hkp://p80.pool.sks-keyservers.net:80 --recv-keys 58118E89F3A912897C070ADBF76221572C52609D
  echo "deb https://apt.dockerproject.org/repo ubuntu-$(lsb_release -c -s) main" | sudo tee /etc/apt/sources.list.d/docker.list
  sudo apt-get update
  sudo apt-get -y install linux-image-extra-$(uname -r) make git docker-engine=$VERSION
  echo "docker installed."
fi

echo e "1b) Configuring docker (TODO remove when services is buildt in docker)"
echo 'DOCKER_OPTS="-H=tcp://0.0.0.0:2375 -H=unix:///var/run/docker.sock"' > /etc/default/docker
sudo service docker restart

echo -e "\n2) Installing PIP\n"
PIP_VERSION=7.1.2
dpkg -l python-pip >/dev/null 2>&1
if [ $? -eq 0 ] ; then
	echo "python-pip installed, removing ...";
	sudo apt-get purge --assume-yes --quiet python-pip
fi
echo "Making sure pip is correct version: $PIP_VERSION";
sudo apt-get install --assume-yes --quiet libffi-dev libssl-dev python-setuptools
sudo easy_install --script-dir=/usr/bin --upgrade pip==$PIP_VERSION

echo -e "\n3) Installing Docker-compose\n"
sudo pip install pyopenssl ndg-httpsclient pyasn1 docker-compose==1.6.2

echo -e "\n4) Installing Graphviz\n"
sudo apt-get install -y graphviz

echo -e "\n5a) Installing Java (TODO remove when services is buildt in Docker)"
javac -version 2>&1 | grep 1.8.0
if [ $? -eq 0 ] ; then
	echo "JDK 8 already installed.";
else
  echo "Installing Oracle jdk 8 ... (no openjdk-8-jdk on Ubuntu 14.04)"
  echo oracle-java8-installer shared/accepted-oracle-license-v1-1 select true | sudo /usr/bin/debconf-set-selections
  sudo add-apt-repository --yes ppa:webupd8team/java
  sudo apt-get update --quiet
  sudo apt-get install --quiet --assume-yes oracle-java8-installer
  sudo update-java-alternatives -s java-8-oracle
  sudo apt-get install --quiet --assume-yes oracle-java8-set-default
  echo "JDK installed."
fi

echo -e "\n5b) Building services (TODO migrate to building in Docker container)\n"
cd /vagrant/redef/services
sudo /vagrant/redef/services/gradlew -PdockerUrl=http://localhost:2375 dockerBuildImage

echo -e "\n6) Provisioning system with docker-compose\n"
cd /vagrant/docker-compose
./docker-compose.sh
sudo docker-compose up -d

echo -e "\n7) Setting up Elasticsearch indices and mappings"
while [ 1 ]; do
  wget --method=POST --retry-connrefused --waitretry=1 --read-timeout=20 --timeout=15 -t 0 -qO- "localhost:8005/search/clear_index" &> /dev/null
  if [ $? = 0 ]; then break; fi;
  sleep 1s;
done;