# Makefile — Developer shortcuts

.PHONY: dev up down migrate seed test lint

# Start all services
dev:
	docker-compose up -d
	@echo "🌱 AgriFarm AI running at http://localhost:3000"
	@echo "📡 API at http://localhost:8000/docs"

up:
	docker-compose up -d

down:
	docker-compose down

# Database
migrate:
	cd backend && alembic upgrade head

seed:
	cd backend && python -m seed.run_seed

# Testing
test:
	cd backend && pytest -v

test-cov:
	cd backend && pytest --cov=modules --cov-report=html

# Linting
lint:
	cd backend && ruff check . --fix
	cd frontend && npx eslint . --fix
