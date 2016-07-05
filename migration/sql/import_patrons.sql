LOAD DATA LOCAL INFILE '/out/patrons.csv'
INTO TABLE borrowers
CHARACTER SET utf8
FIELDS TERMINATED BY ','
OPTIONALLY ENCLOSED BY '\"'
LINES TERMINATED BY '\n'
(userid,cardnumber,surname,firstname,address,zipcode,city,country,smsalertnumber,email,categorycode);
SHOW WARNINGS;