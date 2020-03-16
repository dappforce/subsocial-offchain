#!/usr/bin/env bash

set -e

echo "*** Initialising PostgreSQL"

#sudo apt update

#sudo apt install postgresql postgresql-contrib

#postgres -c "createdb subsocial"
createdb -U postgres subsocial
postgres psql -c "create user dev with encrypted password '1986';"
postgres psql -c "grant all privileges on database subsocial to dev;"

