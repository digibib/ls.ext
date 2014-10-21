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
-- Table structure for table `branches`
--

TRUNCATE TABLE `branches`;
LOCK TABLES `branches` WRITE;
/*!40000 ALTER TABLE `branches` DISABLE KEYS */;
INSERT INTO `branches` (branchcode, branchname) 
VALUES 
("dfb", "Det Flerspråklige Bibliotek"),
("dfbs", "Det Flerspråklige Bibliotek Referanse"),
("fbje", "Bjerke"),
("fbjh", "Bjerke, lokalhistorie"),
("fbji", "Bjerke, innvandrerlitteratur"),
("fbjl", "Bjørnholt læremidler"),
("fbjo", "Bjørnholt"),
("fbju", "Bjørnholt ungdomsskole"),
("fbli", "vet ikke"),
("fbol", "Bøler"),
("fdum", "dummy"),
("ffur", "Furuset"),
("fgam", "Gamle Oslo"),
("fgry", "Grünerløkka"),
("fgyi", "Grünerløkka innvanrerlitteratur"),
("fhol", "Holmlia"),
("flam", "Lambertseter"),
("fmaj", "Majorstua"),
("fnor", "Nordtvet"),
("fnti", "Fnatt!"),
("fnyd", "Nydalen"),
("fopp", "Oppsal"),
("frik", "Rikshospitalet"),
("frmm", "Rommen"),
("froa", "Røa"),
("from", "Romsås"),
("fsme", "Smestad"),
("fsor", "Sørkedalen nærbibliotek"),
("fsti", "Stovner innlån?"),
("fsto", "Stovner"),
("ftoi", "Torshov innvandrerlitteratur"),
("ftor", "Torshov"),
("fxxx", "filial X"),
("hbar", "Barneavdelingen (Hovedutlånet)"),
("hbbr", "Barneavdelingen spesialsamling"),
("hsko", "Skoleavdelingen"),
("hutl", "Hovedbiblioteket"),
("hvkr", "Katalogavdeling referanse"),
("hvlr", "Stjernesamling, lesesalen"),
("hvmu", "Musikkavdelingen (Hovedbiblioteket)"),
("hvur", "Spesialsamling, fjernlån"),
("idep", "depot?"),
("info", "til info?"),
("ukjent", "ukjent avdeling");
/*!40000 ALTER TABLE `branches` ENABLE KEYS */;
UNLOCK TABLES;
