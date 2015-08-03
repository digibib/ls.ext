#!/usr/bin/env bash
echo "Rewriting /home/vagrant/.gradle/gradle.properties with org.gradle.daemon=true"
touch /home/vagrant/.gradle/gradle.properties && echo "org.gradle.daemon=true" > /home/vagrant/.gradle/gradle.properties
