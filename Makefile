run: docs/data.json
	npm start

build: docs/data.json
	npm run prod

fmt:
	prettier src/*.js webpack.config.js --write --use-tabs --print-width 200

docs/data.json: src/helpers.json src/participants.json src/config.json
	python process_json.py > docs/data.json

src/helpers.json: example/helpers.tsv process_helpers.py
	python3 process_helpers.py example/helpers.tsv > $@

src/participants.json: example/participants.tsv process_participants.py
	python process_participants.py example/participants.tsv > $@
