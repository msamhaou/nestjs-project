DATA_DIR=./my-data

up:
	@echo "Creating data directory if it doesn't exist..."
	mkdir -p $(DATA_DIR)
	@echo "Starting Docker Compose..."
	docker-compose up --build

down:
	docker-compose down

clean:
	docker-compose down -v
	rm -rf $(DATA_DIR)

logs:
	docker-compose logs -f
