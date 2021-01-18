#!/usr/bin/env python
import sys
import json
# Given a user-provided spreadsheet of helpers
# Format must be
#
# Timezone (UTC offset)
# Availability in your TZ [start-end]
# Availability in your TZ [start-end]
# Availability in your TZ [start-end]
# Availability in your TZ [start-end]

header = []
data = []
with open(sys.argv[1], 'r') as handle:
    for i, row in enumerate(handle.readlines()):
        if i == 0:
            header = ['TZ', 'Name']
            header += [
                x[x.index('[') + 1:-1] for x in row.strip().split('\t')[2:]
            ]
        else:
            data.append([
                x.split(', ')
                for x in row.strip().split('\t')
            ])


out = []
for row in data:
    rm = {
        'Name': row[0][0],
        'TZ': row[1][0],
    }
    for (hourSection, col) in zip(header[2:], row[2:]):
        (startHour, endHour) = map(int, hourSection.split('-'))
        for o in range(startHour, endHour):
            rm[o] = col
    out.append(rm)

print(json.dumps(out))
