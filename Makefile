.PHONY: install dev bootstrap check validate test build simulate screenshots clean

install:
	npm install

dev:
	npm run dev

bootstrap:
	npm run bootstrap

check:
	npm run check

validate:
	npm run validate

test:
	npm run test

build:
	npm run build

simulate:
	npm run simulate

screenshots:
	npm run screenshots

clean:
	rm -rf .next coverage playwright-report test-results screenshots/generated
