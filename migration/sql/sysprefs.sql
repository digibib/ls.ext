LOCK TABLES `systempreferences` WRITE;
/*!40000 ALTER TABLE `systempreferences` DISABLE KEYS */;

CREATE TEMPORARY TABLE temptable (
  variable varchar(50) NOT NULL,
  value text,
  PRIMARY KEY (variable)
) ENGINE = MyISAM;

LOAD DATA LOCAL INFILE '/out/sysprefs.csv'
INTO TABLE temptable
CHARACTER SET utf8
FIELDS TERMINATED BY ','
OPTIONALLY ENCLOSED BY '\"'
LINES TERMINATED BY '\n'
IGNORE 1 LINES
(variable, value);

UPDATE systempreferences JOIN temptable USING (variable) SET systempreferences.value = temptable.value;
DROP TEMPORARY TABLE temptable;

/*!40000 ALTER TABLE `systempreferences` ENABLE KEYS */;
UNLOCK TABLES;