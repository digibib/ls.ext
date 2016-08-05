LOCK TABLES `columns_settings` WRITE;
/*!40000 ALTER TABLE `columns_settings` DISABLE KEYS */;

LOAD DATA LOCAL INFILE '/out/columns.csv'
INTO TABLE columns_settings
CHARACTER SET utf8
FIELDS TERMINATED BY ','
OPTIONALLY ENCLOSED BY '\''
LINES TERMINATED BY '\n'
IGNORE 1 LINES
(module,page,tablename,columnname,cannot_be_toggled,is_hidden);

/*!40000 ALTER TABLE `columns_settings` ENABLE KEYS */;
UNLOCK TABLES;