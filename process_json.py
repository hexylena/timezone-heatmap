#!/usr/bin/env python
import json
import os
import glob

out = {}
for x in glob.glob(os.path.join('src', '*.json')):
    with open(x, 'r') as h:
        out[x] = json.load(h)

print(json.dumps(out))
