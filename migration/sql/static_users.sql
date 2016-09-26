LOCK TABLES `borrowers` WRITE;
DELETE FROM borrowers WHERE userid IN (
	"api",
	"autoblr",
	"autofuru",
	"autogru",
	"autohol",
	"autolmb",
	"automaj",
	"autonyd",
	"autoopp",
	"autoromm",
	"autoroa",
	"autostv",
	"autotor",
	"autotoy",
	"autohb",
	"doormajor",
	"doorfuru",
	"doortoy",
	"doorboler"
	"doorlamb"
);
/*!40000 ALTER TABLE `borrowers` DISABLE KEYS */;

LOAD DATA LOCAL INFILE '/out/static_users.csv'
INTO TABLE borrowers
CHARACTER SET utf8
FIELDS TERMINATED BY ','
OPTIONALLY ENCLOSED BY '\"'
LINES TERMINATED BY '\n'
IGNORE 1 LINES
(surname,cardnumber,userid,password,branchcode,categorycode,flags,dateexpiry);

/*!40000 ALTER TABLE `borrowers` ENABLE KEYS */;
UNLOCK TABLES;
