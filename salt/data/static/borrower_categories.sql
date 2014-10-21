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
-- Table structure for table `categories`
--

TRUNCATE TABLE `categories`;
LOCK TABLES `categories` WRITE;
/*!40000 ALTER TABLE `categories` DISABLE KEYS */;
INSERT INTO `categories` (categorycode,description,enrolmentperiod,upperagelimit,finetype,overduenoticerequired,category_type)
VALUES 
('ADMIN','administrator',100,0,0,0,'S'),
('AUTO','Automat',99,0,0,0,'A'),
('BKM','Boken kommer',99,99,5,1,'P'),
('HB','Hjemmelåner',99,999,18,1,'A'),
('I','Institusjon',99,999,0,0,'I'),
('FJL','Fjernlån',99,999,18,1,'I'),
('J','Ungdom',99,17,5,1,'C'),
('B','Barn',99,17,5,1,'C'),
('BHG','Barnehage',100,999,0,0,'I'),
('L','Fylkes-/folkebibliotek',99,999,18,1,'I'),
('MXV','Makslån voksen',99,999,18,0,'A'),
('MDL','Midlertidig bosatt',6,999,18,0,'A'),
('PAS','Pasient',99,999,18,0,'A'),
('V','Voksen',99,999,18,1,'A'),
('S','Bibliotekansatt',99,999,18,0,'S'),
('SKO','Skole',99,999,18,1,'I'),
('KL','Grunnskole',99,999,0,0,'I'),
('ELE','Elevlåner',99,999,7,1,'A'),
('U','Ukjent',99,999,0,1,'A'),
('UE','Utgått elev',99,999,0,0,'C'),
('VGS','Videregående skole',99,999,0,0,'I');
/*!40000 ALTER TABLE `categories` ENABLE KEYS */;
UNLOCK TABLES;