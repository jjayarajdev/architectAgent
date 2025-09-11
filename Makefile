.PHONY: help setup build test demo clean run validate

help:
	@echo "EA-MCP-Suite Commands:"
	@echo "  make setup    - Install dependencies"
	@echo "  make build    - Build all packages"
	@echo "  make test     - Run tests"
	@echo "  make demo     - Run demo analysis"
	@echo "  make clean    - Clean build artifacts"
	@echo "  make run      - Run with input.json"
	@echo "  make validate - Validate input.json"

setup:
	pnpm install

build:
	pnpm build

test:
	pnpm test

demo:
	cd apps/cli && pnpm demo

clean:
	pnpm clean
	rm -rf node_modules
	rm -rf packages/*/node_modules
	rm -rf apps/*/node_modules

run:
	cd apps/cli && node dist/index.js run -i ../../examples/input.multitenancy.json

validate:
	cd apps/cli && node dist/index.js validate -i ../../examples/input.multitenancy.json

render-diagrams:
	@echo "Rendering diagrams from .mmd files..."
	@find docs/ea -name "*.mmd" -exec sh -c 'mmdc -i {} -o {}.png || echo "Skipping {} (mermaid-cli not installed)"' \;