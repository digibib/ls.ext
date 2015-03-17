#!/bin/bash
if hash mvn 2>/dev/null; then
	echo "Maven already installed.";
else
  echo "Installing maven ..."
  sudo apt-get install  --quiet --assume-yes maven
  echo "Maven installed."
fi
