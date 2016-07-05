# Migration

## Data flow diagram

![Migration data flow](flow.png?raw=true "Migration data flow")

## How to

* Put the Bibliofil export dumps in the `migration/data` directory.

* Run `make DATASET=full`. Set the target hostname with f.ex: `HOSTNAME=koha2.deichman.no`. Optionally with `LIMIT=n` to limit the number of records to be migrated, and/or `SKIP=n` to skip the first n number of records. Run make with `-j n` to enable paralell processing, with `n` capping the number of jobs to be run at once.

* If you also wish to migrate patrons, loans and reservations, set `MIGRATE_PATRONS=true`.

* If the process stops, just run `make` again, and it will pick up where it left. Run `make  clean` if you want to start all over.

* Recommended command: `sudo make --jobs=4 --output-sync=recurse DATASET=full NOVAGRANT=true`