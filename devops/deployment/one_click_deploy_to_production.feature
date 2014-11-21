# encoding: UTF-8
Feature: One click deploy to production
  As system owner
  In order to reduce likelihood of human error during deployment
  I want an easily triggered automated deployment mechanism

  Solution:
  - Salt-master and minions
  - make-command to initiate deploy of a specific github-revision


  @released
  Scenario: Deployment of state.highstate to "Hjørnebiblioteket"
    Given a revision og ls.ext committed to github
    And a sudo-user on the productions system
    When I issue a certain command including a github-revision
    Then that revision is checked out on the master
    And a salt state.highstate is triggered

  @wip
  Scenario: Rollback

