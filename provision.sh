#!/usr/bin/env bash
echo -e "\n Provisioning for $1 env\n"
echo -e "\n1) Installing Docker\n"
VERSION="1.10.3-0~$(lsb_release -c -s)"
INSTALLED=`dpkg -l | grep docker-engine | awk '{print $3}'`
if [ $VERSION = "$INSTALLED" ] ; then
  echo "docker version $VERSION already installed";
else
  echo "Installing docker version $VERSION ...";
  sudo apt-get purge --assume-yes --quiet docker-engine >/dev/null 2>&1 || true
  sudo apt-key adv --keyserver hkp://p80.pool.sks-keyservers.net:80 --recv-keys 58118E89F3A912897C070ADBF76221572C52609D
  echo "deb https://apt.dockerproject.org/repo ubuntu-$(lsb_release -c -s) main" | sudo tee /etc/apt/sources.list.d/docker.list
  sudo apt-get update
  sudo apt-get -y -o Dpkg::Options::=--force-confdef -o Dpkg::Options::=--force-confold \
    install linux-image-extra-$(uname -r) make git docker-engine=$VERSION
  sudo echo 'DOCKER_OPTS="--storage-driver=aufs"' > /etc/default/docker
  sudo service docker restart
  echo "docker installed."
fi

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
which dot > /dev/null || sudo apt-get install -y graphviz

echo -e "\n5) Making sure secrets.env is present\n"
if [ ! -f /vagrant/docker-compose/secrets.env ]; then
  touch /vagrant/docker-compose/secrets.env
fi

echo -e "\n6) Provisioning system with docker-compose\n"
cd /vagrant/docker-compose
source docker-compose.env
source secrets.env
case "$1" in
  'build')
  envsubst < "docker-compose-template-dev-CI.yml" > "docker-compose.yml"
  ;;
  'prod')
  envsubst < "docker-compose-template-prod.yml" > "docker-compose.yml"
  ;;
  *)
  envsubst < "docker-compose-template-dev.yml" > "docker-compose.yml"
  ;;
esac
sudo docker-compose stop overview && sudo docker-compose rm -f overview
sudo docker-compose up -d

if [ "$1" = "prod"]; then
  exit 0
fi

echo -e "\n7) Attempting to set up Elasticsearch indices and mappings"
for i in {1..10}; do
  wget --method=POST --retry-connrefused --waitretry=1 --read-timeout=20 --timeout=15 -t 0 -qO- "localhost:8005/search/clear_index" &> /dev/null
  if [ $? = 0 ]; then break; fi;
  sleep 3s;
done;
