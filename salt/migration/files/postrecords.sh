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
  echo -e "\nUsage:\n$0 -d records_directory -r replace_placeholder_namespace\n"
  exit 1
}

postRecords() {
  local FILES="$1/*.nt"
  local REPLACE="$2"
  local ENDPOINT="http://$REPLACE/publication"
  local RES

  for file in ${FILES}; do
    SED=`sed -e "s|placeholder.com|$REPLACE|mg" ${file}`
    RES=`echo ${SED} | curl --silent -H "Content-Type: application/n-triples; charset=UTF-8" -X POST $ENDPOINT -d @-`
    RETVAL=$?
    if [[ $RETVAL -eq true ]]; then      # For some strange reason, RETVAL0|1 is treated as boolean true|false
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

while getopts d:n: opts; do
   case ${opts} in
      d) DIR=${OPTARG} ;;
      n) NAMESPACE=${OPTARG} ;;
   esac
done

if [ -z "$DIR" ] || [ -z "$NAMESPACE" ] ; then
  usage
fi

postRecords $DIR $NAMESPACE
