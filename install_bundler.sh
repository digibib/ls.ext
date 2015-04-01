#!/bin/bash
if hash bundle 2>/dev/null; then
	echo "Bundler already installed.";
else
  echo "Installing bundler ..."
  sudo gem install bundler
  echo "Bundler installed."
fi