
clean_data:
  cmd.run:
    - cwd: {{ pillar['migration-data-folder'] }}
    - name: rm -f *.csv *.sql *.txt *.marcxml
