#!/bin/bash
if [ command -v mvn >/dev/null 2>&1 ]; then
	echo "Maven already installed.";
else
  echo "Installing maven ..."
  sudo apt-get install  --quiet --assume-yes maven
  echo "Maven installed."
fi
