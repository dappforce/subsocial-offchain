#!/usr/bin/env bash

set -e

echo "*** Initialising PostgreSQL"

#sudo apt update

sudo apt install postgresql postgresql-contrib

sudo su - postgres -c "createdb subsocial"
sudo -u postgres psql -c "create user dev with encrypted password '1986';"
sudo -u postgres psql -c "grant all privileges on database subsocial to des;"

