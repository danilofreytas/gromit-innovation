PORT ?= 8099

.PHONY: all build check serve clean
all: build check

build:
	python3 frontend/build.py

check: build
	python3 frontend/check.py

serve: build
	python3 -m http.server $(PORT) --directory frontend/dist

clean:
	rm -rf frontend/dist
