INSERT INTO borrower_sync (borrowernumber, synctype, sync)
SELECT borrowers.borrowernumber, 'norwegianpatrondb', 0
FROM borrowers
WHERE NOT EXISTS (SELECT * FROM borrower_sync WHERE borrowers.borrowernumber=borrower_sync.borrowernumber);
