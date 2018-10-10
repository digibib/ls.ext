#!/usr/bin/env bash

# Javarunner
# ----------

pid=0

term_handler() {
  if [ $pid -ne 0 ]; then
    kill -SIGTERM "$pid"
    wait "$pid"
  fi
  exit 143; # 128 + 15 -- SIGTERM
}

trap 'kill ${!}; term_handler' SIGTERM

java $* &
pid="$!"

while true
do
  tail -f /dev/null & wait ${!}
done
