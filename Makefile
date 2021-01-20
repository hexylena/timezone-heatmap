run: src/helpers.json src/participants.json
	npm start

build: src/helpers.json src/participants.json
	npm run prod

src/helpers.json: example/helpers.tsv process_helpers.py
	python3 process_helpers.py example/helpers.tsv > $@

src/participants.json: example/participants.tsv process_participants.py
	python process_participants.py example/participants.tsv > $@
