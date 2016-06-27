# Migration

## Data flow diagram

Comming soon.

## How to

* Put the Bibliofil export dumps in the `migration/data` directory.

* Run `make DATASET=full`. Optionally with `LIMIT=n` to limit the number of records to be migrated. Run make with `-j n` to enable paralell processing, with `n` capping the number of jobs to be run at once.

* If the process stops, just run `make` again, and it will pick up where it left. Run `make  clean` if you want to start all over.