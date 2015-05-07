#!/bin/bash
if [ ! -f ~/.upgrade_done ]
then
  sudo apt-get update --quiet && sudo apt-get upgrade --quiet --assume-yes
  echo "A restart will make upgraded packages take effect."
  touch ~/.upgrade_done
fi
