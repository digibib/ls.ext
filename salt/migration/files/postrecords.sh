#!/bin/bash
# push records to ls.ext Services
set -e

MSG=""
SUCCESSCOUNT=0
FAILCOUNT=0

trap "cleanup" INT TERM EXIT

cleanup() {
    echo -e "-------"
    echo -e "SUCCESSCOUNT: $SUCCESSCOUNT"
    echo -e "FAILCOUNT:    $FAILCOUNT"
    echo -e "-------"
    echo -e "$MSG"
    if [ $FAILCOUNT -gt 0 ];
    then
      exit 1
    else
      exit 0
    fi
}

usage() { 
  echo -e "\nUsage:\n$0 records_directory \n"
  exit 1
}

postRecords() {
  local ENDPOINT="http://192.168.50.12:8005/publication"
  local FILES="$1/*.nt"
  local RES

  for file in ${FILES}; do
    CMD="curl --silent -H \"Content-Type: text/ntriples\" -X POST $ENDPOINT -d@${file}"
    RES=`curl --silent -H "Content-Type: text/ntriples" -X POST $ENDPOINT -d@${file}`
    RETVAL=$?
    if [[ $RETVAL -ne 0 ]]; then
      SUCCESSCOUNT=$((SUCCESSCOUNT+1))
      MSG+="POST OK    : ${file}"
      MSG+="\n-------\n"
      rm -rf "${file}"
    else
      FAILCOUNT=$((FAILCOUNT+1))
      MSG+="POST FAILED: ${file}"
      MSG+="\n-------\n"
      MSG+="RESPONSE:\n$RES"
      MSG+="\n-------\n"
    fi
  done
}

case "$1" in
    "")
    usage
    ;;
  --dir|-d)
    shift
    postRecords $1
    ;;
esac