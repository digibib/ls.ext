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
-- Table structure for table `itemtypes`
--

TRUNCATE TABLE `itemtypes`;
LOCK TABLES `itemtypes` WRITE;
/*!40000 ALTER TABLE `itemtypes` DISABLE KEYS */;
INSERT INTO `itemtypes` (itemtype,description,rentalcharge,notforloan,imageurl,summary,checkinmsg,checkinmsgtype)
VALUES 
('A','Kart',NULL,NULL,NULL,NULL,NULL,'message'),
('AB','Atlas',NULL,NULL,NULL,NULL,NULL,'message'),
('B','Manuskripter',NULL,NULL,NULL,NULL,NULL,'message'),
('C','Noter',0.0000,0,'bridge/score.gif',NULL,NULL,'message'),
('DA','Lydopptak - grammofonplate',NULL,NULL,NULL,NULL,NULL,'message'),
('DA,DG','Lydopptak - grammofonplate - musikk',NULL,NULL,NULL,NULL,NULL,'message'),
('DA,DH','Lydopptak - grammofonplate - språkkurs',NULL,NULL,NULL,NULL,NULL,'message'),
('DA,DI','Lydopptak - grammofonplate - lydbok',NULL,NULL,NULL,NULL,NULL,'message'),
('DA,DJ','Lydopptak - grammofonplate - annet',NULL,NULL,NULL,NULL,NULL,'message'),
('DB','Lydopptak - kassett',NULL,NULL,NULL,NULL,NULL,'message'),
('DB,DG','Lydopptak - kassett - musikk',NULL,NULL,NULL,NULL,NULL,'message'),
('DB,DH','Lydopptak - kassett - språkkurs',NULL,NULL,NULL,NULL,NULL,'message'),
('DB,DI','Lydopptak - kassett - lydbok',NULL,NULL,NULL,NULL,NULL,'message'),
('DB,DJ','Lydopptak - kassett - annet',NULL,NULL,NULL,NULL,NULL,'message'),
('DC','Lydopptak - kompaktplate',NULL,NULL,NULL,NULL,NULL,'message'),
('DC,DG','Lydopptak - kompaktplate - musikk',NULL,NULL,NULL,NULL,NULL,'message'),
('DC,DH','Lydopptak - kompaktplate - språkkurs',NULL,NULL,NULL,NULL,NULL,'message'),
('DC,DI','Lydopptak - kompaktplate - lydbok',NULL,NULL,NULL,NULL,NULL,'message'),
('DC,DI,DZ','Lydopptak - kompaktplate MP3 - lydbok',NULL,NULL,NULL,NULL,NULL,'message'),
('DC,DJ','Lydopptak - kompaktplate - annet',NULL,NULL,NULL,NULL,NULL,'message'),
('DD','Lydopptak - digibok',NULL,NULL,NULL,NULL,NULL,'message'),
('DD,DI','Lydopptak - digibok - lydbok',NULL,NULL,NULL,NULL,NULL,'message'),
('DE,DI','Lydopptak - digikort - lydbok',NULL,NULL,NULL,NULL,NULL,'message'),
('DG','Lydopptak - musikk',NULL,NULL,NULL,NULL,NULL,'message'),
('DH','Lydopptak - språkkurs',NULL,NULL,NULL,NULL,NULL,'message'),
('DI','Lydopptak - lydbok',NULL,NULL,NULL,NULL,NULL,'message'),
('DJ','Lydopptak - annen tale, annet',NULL,NULL,NULL,NULL,NULL,'message'),
('DK','Kombidokument',NULL,NULL,NULL,NULL,NULL,'message'),
('DZ','Lydopptak - mp3',NULL,NULL,NULL,NULL,NULL,'message'),
('EA','Film og video - filmkassett',NULL,NULL,NULL,NULL,NULL,'message'),
('EB','Film og video - filmsløyfe',NULL,NULL,NULL,NULL,NULL,'message'),
('EC','Film og video - filmspole',NULL,NULL,NULL,NULL,NULL,'message'),
('ED','Film og video - videokassett',NULL,NULL,NULL,NULL,NULL,'message'),
('ED,DG','Musikk-video',0.0000,0,NULL,NULL,NULL,'message'),
('ED,DH','Film og video - videokassett - språkkurs',NULL,NULL,NULL,NULL,NULL,'message'),
('ED,TF','Film og video - videokassett - for døve',NULL,NULL,NULL,NULL,NULL,'message'),
('EE','Film og video - videoplate DVD',0.0000,0,NULL,NULL,NULL,'message'),
('EE,DG','Film- og video - Videoplate DVD - musikk',0.0000,0,NULL,NULL,NULL,'message'),
('EE,DH','Film- og video - Videoplate DVD - språkkurs',0.0000,0,NULL,NULL,NULL,'message'),
('EE,DI','Film- og video - Videoplate DVD - lydbok',0.0000,0,NULL,NULL,NULL,'message'),
('EE,TF','Film og video - videoplate DVD - for døve',0.0000,0,NULL,NULL,NULL,'message'),
('EF','Film og video - blu-ray',NULL,NULL,NULL,NULL,NULL,'message'),
('EG','Film og video - 3D blu-ray',NULL,NULL,NULL,NULL,NULL,'message'),
('FA','Grafisk materiale - bilde',NULL,NULL,NULL,NULL,NULL,'message'),
('FB','Grafisk materiale - bildebånd',NULL,NULL,NULL,NULL,NULL,'message'),
('FC','Grafisk materiale - bildekort',NULL,NULL,NULL,NULL,NULL,'message'),
('FD','Grafisk materiale - dias',NULL,NULL,NULL,NULL,NULL,'message'),
('FE','Grafisk materiale - flippover-blokk',NULL,NULL,NULL,NULL,NULL,'message'),
('FF','Grafisk materiale - fotografi',NULL,NULL,NULL,NULL,NULL,'message'),
('FG','Grafisk materiale - grafisk blad',NULL,NULL,NULL,NULL,NULL,'message'),
('FH','Grafisk materiale - hologram',NULL,NULL,NULL,NULL,NULL,'message'),
('FI','Grafisk materiale - kunstreproduksjon',NULL,NULL,NULL,NULL,NULL,'message'),
('FJ','Grafisk materiale - ordkort',NULL,NULL,NULL,NULL,NULL,'message'),
('FK','Grafisk materiale - originalt kunstverk',NULL,NULL,NULL,NULL,NULL,'message'),
('FL','Grafisk materiale - plakat',NULL,NULL,NULL,NULL,NULL,'message'),
('FM','Grafisk materiale - plansje',NULL,NULL,NULL,NULL,NULL,'message'),
('FN','Grafisk materiale - postkort',NULL,NULL,NULL,NULL,NULL,'message'),
('FO','Grafisk materiale - røntgenbilde',NULL,NULL,NULL,NULL,NULL,'message'),
('FP','Grafisk materiale - stereobilde',NULL,NULL,NULL,NULL,NULL,'message'),
('FQ','Grafisk materiale - studieplansje',NULL,NULL,NULL,NULL,NULL,'message'),
('FR','Grafisk materiale - symbolkort',NULL,NULL,NULL,NULL,NULL,'message'),
('FS','Grafisk materiale - teknisk tegning',NULL,NULL,NULL,NULL,NULL,'message'),
('FT','Grafisk materiale - transparent',NULL,NULL,NULL,NULL,NULL,'message'),
('G','Elektroniske ressurser',NULL,NULL,NULL,NULL,NULL,'message'),
('GA','Nedlastbar fil',NULL,NULL,NULL,NULL,NULL,'message'),
('GA,DZ,DG','Nedlastbar musikk, MP3',NULL,NULL,NULL,NULL,NULL,'message'),
('GA,NA','Nedlastbar e-bok, PDF',NULL,NULL,NULL,NULL,NULL,'message'),
('GB','Elektroniske ressurser - diskett',NULL,NULL,NULL,NULL,NULL,'message'),
('GC','Elektroniske ressurser - DVD-ROM',NULL,NULL,NULL,NULL,NULL,'message'),
('GC,MA','Dataspill - PC - DVD-ROM',NULL,NULL,NULL,NULL,NULL,'message'),
('GC,MB','Dataspill - Playstation2 - DVD-ROM',NULL,NULL,NULL,NULL,NULL,'message'),
('GC,MI','Dataspill - Xbox - DVD-ROM',NULL,NULL,NULL,NULL,NULL,'message'),
('GC,MJ','Dataspill - Xbox 360 - DVD-ROM',NULL,NULL,NULL,NULL,NULL,'message'),
('GD','Elektroniske ressurser - CD-ROM',NULL,NULL,NULL,NULL,NULL,'message'),
('GD,MA','Dataspill - PC - CD-ROM',NULL,NULL,NULL,NULL,NULL,'message'),
('GE','Elektroniske ressurser - Nettressurs',NULL,NULL,NULL,NULL,NULL,'message'),
('GF','Elektroniske ressurser - Lagringsbrikke',NULL,NULL,NULL,NULL,NULL,'message'),
('GF,MN','Elektroniske ressurser - Lagringsbrikke - Nintendo DS',NULL,NULL,NULL,NULL,NULL,'message'),
('GG','Elektroniske ressurser - Blue-ray-ROM',NULL,NULL,NULL,NULL,NULL,'message'),
('GG,MC','Dataspill - Playstation 3 - Blu-ray-ROM',NULL,NULL,NULL,NULL,NULL,'message'),
('GH','Elektroniske ressurser - UMD',NULL,NULL,NULL,NULL,NULL,'message'),
('GH,MD','Dataspill - Playstation Portable - UMD',NULL,NULL,NULL,NULL,NULL,'message'),
('GI,MO','Dataspill - Wii-plate',NULL,NULL,NULL,NULL,NULL,'message'),
('GT','Elektroniske ressurser - DTBok',NULL,NULL,NULL,NULL,NULL,'message'),
('H','Tredimensjonal gjenstander',NULL,NULL,NULL,NULL,NULL,'message'),
('IA','Mikroformer - mikrofilmkassett',NULL,NULL,NULL,NULL,NULL,'message'),
('IB','Mikroformer - mikrofilmspole',NULL,NULL,NULL,NULL,NULL,'message'),
('IC','Mikroformer - mikrofilmkort',NULL,NULL,NULL,NULL,NULL,'message'),
('ID','Mikroformer - mikro-opak',NULL,NULL,NULL,NULL,NULL,'message'),
('IE','Mikroformer - vinduskassettt',NULL,NULL,NULL,NULL,NULL,'message'),
('J','Periodika',NULL,NULL,NULL,NULL,NULL,'message'),
('K','Artikler (i periodika eller bøker)',NULL,NULL,NULL,NULL,NULL,'message'),
('L','Bok',NULL,NULL,NULL,NULL,NULL,'message'),
('LA','E-bok',NULL,NULL,NULL,NULL,NULL,'message'),
('MA','Dataspill - PC',NULL,NULL,NULL,NULL,NULL,'message'),
('MB','Dataspill - Playstation 2',NULL,NULL,NULL,NULL,NULL,'message'),
('MC','Dataspill - Playstation 3',NULL,NULL,NULL,NULL,NULL,'message'),
('MD','Dataspill - Playstation portable',NULL,NULL,NULL,NULL,NULL,'message'),
('MI','Dataspill - Xbox',NULL,NULL,NULL,NULL,NULL,'message'),
('MJ','Dataspill - Xbox 360',NULL,NULL,NULL,NULL,NULL,'message'),
('MN','Dataspill - Nintendo DS',NULL,NULL,NULL,NULL,NULL,'message'),
('MO','Dataspill - Nintendo Wii',NULL,NULL,NULL,NULL,NULL,'message'),
('NA','PDF',NULL,NULL,NULL,NULL,NULL,'message'),
('NB','EPUB',NULL,NULL,NULL,NULL,NULL,'message'),
('NL','WMA',NULL,NULL,NULL,NULL,NULL,'message'),
('NS','WMV',NULL,NULL,NULL,NULL,NULL,'message'),
('O','DRM',NULL,NULL,NULL,NULL,NULL,'message'),
('SM','Utkånstidskrift',NULL,NULL,NULL,NULL,NULL,'message'),
('VO','Vertikalordner',NULL,NULL,NULL,NULL,NULL,'message');
/*!40000 ALTER TABLE `itemtypes` ENABLE KEYS */;
UNLOCK TABLES;