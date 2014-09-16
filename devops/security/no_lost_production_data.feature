# encoding: UTF-8

Feature: Retain production data across upgrades
  As system owner
  In order to avoid being killed by an angry mob
  I wish to retain production data across deploys / upgrades

  Options:
  - Separate mysql-server-instance from the normal redeployment
  - Move data directory out of the deployment unit
  - Do backup /restore

  Scenario: A system change is best done by rebuild the koha-server environment
