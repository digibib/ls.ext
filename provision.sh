#!/usr/bin/env bash
if [ "$#" -ne 3 ]; then
  echo "provision.sh takes exactly three parameters:"
  echo "  provision.sh [lsenv] [lsextpath] [host]"
fi
export LSENV=$1
export LSEXTPATH=$2
export HOST=$3
echo -e "\n Provisioning for $LSENV env, LSENV=$LSENV, LSEXTPATH=$LSEXTPATH, HOST=$HOST\n"
if [[ `uname -s` == 'Linux' ]]; then
  echo -e "\n1) Installing Docker\n"
  VERSION="17.09.0~ce-0~ubuntu"
  INSTALLED=`dpkg -l | grep docker-engine | awk '{print $3}'`
  if [ $VERSION = "$INSTALLED" ] ; then
    echo "docker version $VERSION already installed";
  else
    echo "Installing docker version $VERSION ...";
    sudo apt-get purge --assume-yes --quiet docker-engine docker-ce docker.io >/dev/null 2>&1 || true
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -
    echo "deb [arch=amd64] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list
    sudo apt-get update
    sudo apt-get -y -o Dpkg::Options::=--force-confdef -o Dpkg::Options::=--force-confold \
      install linux-image-extra-$(uname -r) linux-image-extra-virtual make git docker-ce=$VERSION
    sudo echo 'DOCKER_OPTS="--storage-driver=aufs"' > /etc/default/docker
    sudo service docker restart
    echo "docker installed."
  fi

  echo -e "\n2) Installing Docker-compose\n"
  COMPOSEVERSION=1.16.1
  INSTALLED=`docker-compose -v | cut -d',' -f1 | cut -d' ' -f3`
  if [ $COMPOSEVERSION = "$INSTALLED" ] ; then
    echo "docker-compose version $COMPOSEVERSION already installed"
  else
    sudo bash -c "curl -s -L https://github.com/docker/compose/releases/download/$COMPOSEVERSION/docker-compose-`uname -s`-`uname -m` > /usr/local/bin/docker-compose"
    sudo chmod +x /usr/local/bin/docker-compose
  fi

  echo -e "Configuring system for elasticsearch"
  sudo sysctl -w vm.max_map_count=262144

else
  echo "Cannot provision for OSX; please install docker & docker-compose yourself"
  echo "You also need envsubst (TODO find a cross-platform solution)"
  echo "You also need to configure vm.max_map_count on your host, see this link:"
  echo "https://www.elastic.co/guide/en/elasticsearch/reference/current/docker.html#docker-prod-cluster-composefile"
fi

echo -e "\n4) Provisioning system with docker-compose\n"
cd "$LSEXTPATH/docker-compose"
source docker-compose.env

export OVERVIEW_BUILD_DIR="$LSEXTPATH/redef/overview"

CMD="sudo KOHA_IMAGE_TAG=${KOHA_IMAGE_TAG} GITREF=${GITREF} docker-compose -f common.yml"
$CMD stop overview && $CMD rm -f overview

case "$LSENV" in
  'build')
  $CMD -f ci.yml up -d
  ;;
  *)
  $CMD -f dev.yml up -d
  ;;
esac


echo -e "\n6) Attempting to set up Elasticsearch indices and mappings"
for i in {1..10}; do
  wget --method=POST --retry-connrefused --waitretry=1 --read-timeout=20 --timeout=15 -t 0 -qO- "$HOST:8005/search/clear_index" &> /dev/null
  if [ $? = 0 ]; then break; fi;
  sleep 3s;
done;
