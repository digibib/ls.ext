# encoding: UTF-8

Feature: Only tested artifacts in production
  As system owner
  In order to reduce risk of system errors
  I want to deploy only tested artifacts in production

  Solution:
  - Differences between local development ls.ext and deployed system kept minimal
  - Strive to put functionality in revision-tagged docker-images - especially our custom/custumized artifacts
  - Use specific - tested - versions of artifacts in all environments (dev, test, prod)
