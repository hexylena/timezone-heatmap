#!/usr/bin/env python
import sys
import json
import collections

c = collections.Counter()

with open(sys.argv[1], 'r') as handle:
    for row in handle.readlines():
        c[row.strip()] += 1

print(json.dumps(dict(c.items())))
