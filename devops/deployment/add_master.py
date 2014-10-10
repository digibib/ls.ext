#!/usr/bin/env python
# script to add minion config
import yaml
import sys
import os
f=open("/etc/salt/minion", 'r')
settings=yaml.load(f)
f.close()
ip=os.environ["MASTER_IP"]
if settings["master"].__class__ == str:
  settings["master"] = [settings["master"]]
settings["master"] = [ip]
#if not ip in settings["master"]:
#  settings["master"].insert(0, ip)
f=open("/etc/salt/minion", 'w')
f.write(yaml.dump(settings))
f.close()
print "Success:"
