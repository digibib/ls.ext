#!/bin/bash
# small script to inject Koha db version to fresh install not done by webinstaller
KOHAVERSION=`perl -e 'require "/usr/share/koha/intranet/cgi-bin/kohaversion.pl" ; print kohaversion();' 2> /dev/null`
if [ -n "$KOHAVERSION" ]
then
  KOHADBVERSION=`echo ${KOHAVERSION} | awk -F. '{ print $1"."$2$3$4 }'`
  KOHADBVERSIONOLD=`echo -n "SELECT value as '' FROM systempreferences WHERE variable = 'Version';" | sudo koha-mysql $INSTANCE | tail -1`
  #KOHADBVERSIONNEW = ''.join(kohaversion.rsplit('.', 2)) %}
  if [ $KOHADBVERSIONOLD ] && [ $KOHADBVERSIONOLD == $KOHADBVERSION ]
  then
    # Up to date!
    CMD=""
    CHANGED=no
    COMMENT='koha DB version already up to date!'
  else
    # Update!
    CMD="INSERT INTO systempreferences (variable,value,options,explanation,type) \
        VALUES ('Version','$KOHADBVERSION',NULL,'The Koha database version. WARNING: Do not change \
        this value manually, it is maintained by the webinstaller',NULL) \
        ON DUPLICATE KEY UPDATE value = '$KOHADBVERSION' ;" 
    echo "${CMD}" | koha-mysql $INSTANCE
    CHANGED=yes
    COMMENT='koha DB version updated!'
  fi
else
  echo "{\"ERROR\":\"MISSING INSTANCENAME OR NO KOHAVERSION!\"}"
  exit 1
fi

# return Salt State line
echo  # an empty line here so the next line will be the last.
#echo "changed=$CHANGED comment=$COMMENT version=$KOHADBVERSION cmd=$CMD instance=$INSTANCE kohadbversionold=$KOHADBVERSIONOLD"
echo "{\"changed\":\"$CHANGED\",\
          \"comment\":\"$COMMENT\",\
          \"cmd\":\"$CMD\",\
          \"instance\":\"$INSTANCE\",\
          \"newdbversion\":\"$KOHADBVERSION\",\
          \"olddbversion\":\"$KOHADBVERSIONOLD\"\
          }"