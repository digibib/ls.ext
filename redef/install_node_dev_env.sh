#!/bin/bash
node --version 2>&1 | grep 0.12
if [ $? -eq 0 ] ; then
	echo "Node stuff already installed.";
else
  echo "Installing node stuff"
  sudo apt-get install --quiet --assume-yes build-essential > /dev/null
  curl -sL https://deb.nodesource.com/setup_0.12 | sudo bash -
  sudo apt-get install  --quiet --assume-yes nodejs
  sudo npm install -g nodemon
  sudo npm install -g jslint
  sudo npm install -g mocha
  echo "Node stuff installed."
fi
