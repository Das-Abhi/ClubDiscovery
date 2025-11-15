.PHONY: help install dev up down build clean logs test lint format

help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Available targets:'
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  %-15s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

install: ## Install dependencies
	@echo "Installing frontend dependencies..."
	cd frontend && npm install
	@echo "Installing backend dependencies..."
	cd backend && pip install -r requirements.txt

dev: ## Start development environment with Docker
	docker-compose up

up: ## Start all services in background
	docker-compose up -d

down: ## Stop all services
	docker-compose down

build: ## Build all Docker images
	docker-compose build

clean: ## Clean up Docker resources
	docker-compose down -v
	docker system prune -f

logs: ## Show logs from all services
	docker-compose logs -f

logs-frontend: ## Show frontend logs
	docker-compose logs -f frontend

logs-backend: ## Show backend logs
	docker-compose logs -f backend

logs-db: ## Show database logs
	docker-compose logs -f db

test: ## Run tests
	@echo "Running frontend tests..."
	cd frontend && npm test
	@echo "Running backend tests..."
	cd backend && pytest

lint: ## Run linters
	@echo "Linting frontend..."
	cd frontend && npm run lint
	@echo "Linting backend..."
	cd backend && flake8 app

format: ## Format code
	@echo "Formatting backend code..."
	cd backend && black app && isort app

db-migrate: ## Run database migrations
	cd backend && alembic upgrade head

db-migration: ## Create new migration
	@read -p "Enter migration message: " msg; \
	cd backend && alembic revision --autogenerate -m "$$msg"

shell-backend: ## Open backend container shell
	docker-compose exec backend bash

shell-db: ## Open database shell
	docker-compose exec db psql -U postgres -d clubcompass

shell-redis: ## Open Redis CLI
	docker-compose exec redis redis-cli
