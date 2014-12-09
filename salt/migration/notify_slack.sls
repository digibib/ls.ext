#############
# STATE TO NOTIFY SLACK ON SUCCESS
#############

notify_slack:
  cmd.run:
    - name: curl -X POST {{ pillar['slack']['webhook'] }} -d '{"text":"Example data loaded."}'