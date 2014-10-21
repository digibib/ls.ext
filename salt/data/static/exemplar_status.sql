-- MySQL dump 10.13  Distrib 5.5.32, for debian-linux-gnu (x86_64)
--
-- Host: localhost    Database: koha_{{ pillar['koha']['instance'] }}
-- ------------------------------------------------------
-- Server version 5.5.32-0ubuntu0.13.04.1

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


--
-- Table structure for table `authorised_values`
--

LOCK TABLES `authorised_values` WRITE;
/*!40000 ALTER TABLE `authorised_values` DISABLE KEYS */;
-- Autoriserte verdier for eksemplarstatuser:
DELETE FROM authorised_values WHERE category IN ("WITHDRAWN", "LOST", "NOT_LOAN", "RESTRICTED", "DAMAGED");
INSERT INTO authorised_values (category, authorised_value, lib) VALUES
("WITHDRAWN", "1", "trukket tilbake"),
("DAMAGED", "1", "skadet"),
("LOST", "1", "tapt"),
("LOST", "2", "regnes som tapt"),
("LOST", "3", "tapt og erstattet"),
("LOST", "4", "ikke på plass"),
("LOST", "5", "påstått levert"),
("LOST", "6", "påstått ikke lånt"),
("LOST", "7", "borte i transport"),
("LOST", "8", "tapt, regning betalt"),
("LOST", "9", "vidvanke, registrert forsvunnet"),
("LOST", "10", "retur eieravdeling (ved import"),
("LOST", "11", "til henteavdeling (ved import)"),
("NOT_LOAN", "-1", "i bestilling"),
("NOT_LOAN", "2", "ny"),
("NOT_LOAN", "3", "til internt bruk"),
("NOT_LOAN", "4", "til katalogisering"),
("NOT_LOAN", "5", "vurderes kassert"),
("NOT_LOAN", "6", "til retting"),
("NOT_LOAN", "7", "til innbinding"),
("RESTRICTED", "1", "begrenset tilgang"),
("RESTRICTED", "2", "referanseverk");
/*!40000 ALTER TABLE `authorised_values` ENABLE KEYS */;
UNLOCK TABLES;

