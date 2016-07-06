LOAD DATA LOCAL INFILE '/out/patrons.csv'
INTO TABLE borrowers
CHARACTER SET utf8
FIELDS TERMINATED BY ','
OPTIONALLY ENCLOSED BY '\"'
LINES TERMINATED BY '\n'
(userid,cardnumber,surname,firstname,address,address2,zipcode,city,country,phone,smsalertnumber,email,categorycode,privacy,branchcode,sex);
SHOW WARNINGS;