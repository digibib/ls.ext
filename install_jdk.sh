#!/bin/bash
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
