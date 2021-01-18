

src/helpers.json: helpers.tsv process_helpers.py
	python3 process_helpers.py helpers.tsv > $@
