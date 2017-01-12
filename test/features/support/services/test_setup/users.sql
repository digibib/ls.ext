INSERT IGNORE INTO borrowers (surname,branchcode,cardnumber,userid,password,flags,categorycode,dateexpiry)
VALUES
('Superlibrarian','hutl','STAFF1','super','__API_PASS__',1,'ANS','2199-12-31'),
('API-user','hutl','api','api','__API_PASS__',1,'API','2199-12-31'),
('AUTOMAT-user','hutl','A001','autohb','__SIP_PASS__',2,'AUTO','2199-12-31');
