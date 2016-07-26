#!/usr/bin/env bash

# wait until database is responding and has been populated by koha web installer
while true; do
  mysql --protocol=tcp -h koha_mysql -u"$KOHA_MYSQL_USER" -p"$KOHA_MYSQL_PASS" "$KOHA_MYSQL_DB" -e "SELECT COUNT(*) FROM categories"
  if [ $? = 0 ]; then break; fi;
  sleep 3s;
done;

set -e

# Setup Koha REST api user
# ------------------------
# Add patron category for API user
mysql --protocol=tcp -h koha_mysql -u"$KOHA_MYSQL_USER" -p"$KOHA_MYSQL_PASS" "$KOHA_MYSQL_DB" -e "INSERT IGNORE INTO categories(categorycode, description) VALUES ('API', 'API-user')"
# Add branch for API user
mysql --protocol=tcp -h koha_mysql -u"$KOHA_MYSQL_USER" -p"$KOHA_MYSQL_PASS" "$KOHA_MYSQL_DB" -e "INSERT IGNORE INTO branches(branchcode, branchname) VALUES ('api', 'Intern API avdeling')"
# Add user with permissions needed for API use
mysql --protocol=tcp -h koha_mysql -u"$KOHA_MYSQL_USER" -p"$KOHA_MYSQL_PASS" "$KOHA_MYSQL_DB" -e "INSERT IGNORE INTO borrowers(surname,branchcode,cardnumber,userid,password,flags,categorycode,privacy,dateexpiry) VALUES ('$KOHA_API_USER', 'api', '$KOHA_API_USER','$KOHA_API_USER','$KOHA_API_PASS_ENCRYPTED',1,'API',1,'2199-12-31')"


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
