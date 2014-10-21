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
-- Table structure for table `issuingrules`
--

TRUNCATE TABLE `issuingrules`;
LOCK TABLES `issuingrules` WRITE;
/*!40000 ALTER TABLE `issuingrules` DISABLE KEYS */;
INSERT INTO `issuingrules` (categorycode,itemtype,fine,finedays,firstremind,chargeperiod,maxissueqty,issuelength,lengthunit,hardduedate,hardduedatecompare,renewalsallowed,renewalperiod,reservesallowed,branchcode,overduefinescap)
VALUES 
('*','*',0.000000,0,7,14,20,28,'days',NULL,-1,2,14,20,'*',NULL),
('*','A',0.000000,0,0,21,NULL,28,'days',NULL,-1,3,28,20,'*',NULL),
('*','C',0.000000,0,0,21,NULL,28,'days',NULL,-1,3,28,20,'*',NULL),
('*','DB,DG',0.000000,0,0,21,NULL,14,'days',NULL,-1,3,14,20,'*',NULL),
('*','DB,DH',0.000000,0,0,21,NULL,28,'days',NULL,-1,3,28,20,'*',NULL),
('*','DB,DI',0.000000,0,0,21,NULL,28,'days',NULL,-1,3,28,20,'*',NULL),
('*','DC,DG',0.000000,0,0,21,NULL,14,'days',NULL,-1,3,14,20,'*',NULL),
('*','DC,DH',0.000000,0,0,21,NULL,28,'days',NULL,-1,3,28,20,'*',NULL),
('*','DC,DI',0.000000,0,0,21,NULL,28,'days',NULL,-1,3,28,20,'*',NULL),
('*','ED',0.000000,0,0,21,NULL,7,'days',NULL,-1,3,7,20,'*',NULL),
('*','ED,DG',0.000000,0,0,21,NULL,14,'days',NULL,-1,3,14,20,'*',NULL),
('*','ED,DH',0.000000,0,0,21,NULL,28,'days',NULL,-1,3,28,20,'*',NULL),
('*','ED,TF',0.000000,0,0,21,NULL,28,'days',NULL,-1,3,28,20,'*',NULL),
('*','EE',0.000000,0,0,21,NULL,7,'days',NULL,-1,3,7,20,'*',NULL),
('*','EE,DG',0.000000,0,0,21,NULL,14,'days',NULL,-1,3,14,20,'*',NULL),
('*','EE,DH',0.000000,0,0,21,NULL,28,'days',NULL,-1,3,28,20,'*',NULL),
('*','EE,DI',0.000000,0,0,21,NULL,28,'days',NULL,-1,3,28,20,'*',NULL),
('*','EE,TF',0.000000,0,0,21,NULL,28,'days',NULL,-1,3,28,20,'*',NULL),
('*','EF',0.000000,0,0,21,NULL,7,'days',NULL,-1,3,7,20,'*',NULL),
('*','GC',0.000000,0,0,21,NULL,28,'days',NULL,-1,3,28,20,'*',NULL),
('*','GD',0.000000,0,0,21,NULL,28,'days',NULL,-1,3,28,20,'*',NULL),
('*','GG',0.000000,0,0,21,NULL,28,'days',NULL,-1,3,28,20,'*',NULL),
('*','J',0.000000,0,0,21,NULL,14,'days',NULL,-1,2,14,0,'*',NULL),
('BKM','*',50.000000,0,14,14,NULL,60,'days',NULL,-1,3,28,20,'*',100.000000),
('I','*',0.000000,0,7,14,NULL,42,'days',NULL,-1,2,28,20,'*',NULL),
('FJL','*',0.000000,0,7,14,NULL,42,'days',NULL,-1,2,28,20,'*',NULL),
('B','*',20.000000,0,7,14,20,28,'days',NULL,-1,2,28,20,'*',20.000000),
('BHG','*',0.000000,0,0,14,NULL,42,'days',NULL,-1,2,28,20,'*',NULL),
('L','*',0.000000,0,0,14,NULL,42,'days',NULL,-1,2,28,20,'*',NULL),
('MXV','*',50.000000,0,7,14,30,28,'days',NULL,-1,2,28,20,'*',100.000000),
('MDL','*',50.000000,0,7,14,2,28,'days',NULL,-1,2,28,20,'*',100.000000),
('PAS','*',0.000000,0,7,14,20,28,'days',NULL,-1,2,28,20,'*',NULL),
('V','*',50.000000,0,7,14,20,28,'days',NULL,-1,2,28,20,'*',100.000000),
('SKO','*',0.000000,0,7,14,NULL,42,'days',NULL,-1,2,28,20,'*',NULL),
('KL','*',0.000000,0,7,28,NULL,60,'days',NULL,-1,8,30,20,'*',NULL),
('ELE','*',0.000000,0,14,14,NULL,28,'days',NULL,-1,3,10,20,'*',NULL),
('U','*',50.000000,0,7,14,NULL,28,'days',NULL,-1,2,28,20,'*',100.000000),
('UE','*',0.000000,0,14,14,NULL,28,'days',NULL,-1,2,10,20,'*',NULL),
('VGS','*',0.000000,0,0,14,NULL,42,'days',NULL,-1,2,28,20,'*',NULL);
/*!40000 ALTER TABLE `issuingrules` ENABLE KEYS */;
UNLOCK TABLES;