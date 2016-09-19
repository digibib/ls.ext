
-- MySQL dump 10.13  Distrib 5.5.32, for debian-linux-gnu (x86_64)
--
-- Script to load data from csv into table `authorised_values`
--

LOCK TABLES `authorised_values` WRITE;
DELETE FROM authorised_values WHERE category IN ("WITHDRAWN", "LOST", "NOT_LOAN", "RESTRICTED", "DAMAGED", "DOORACCESS");
/*!40000 ALTER TABLE `authorised_values` DISABLE KEYS */;

LOAD DATA LOCAL INFILE '/out/avalues.csv'
INTO TABLE authorised_values
CHARACTER SET utf8
FIELDS TERMINATED BY ','
OPTIONALLY ENCLOSED BY '\"'
LINES TERMINATED BY '\n'
IGNORE 1 LINES
(category, authorised_value, lib);

/*!40000 ALTER TABLE `authorised_values` ENABLE KEYS */;
UNLOCK TABLES;