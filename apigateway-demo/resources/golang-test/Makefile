.PHONY: build
vendor:
	go mod vendor

test:
	go test -race ./...

build:
	env GOOS=linux go build -ldflags="-s -w" -o ./asset-output/main

lambda-build:
	env GOOS=linux go build -ldflags="-s -w" -o /asset-output/main
