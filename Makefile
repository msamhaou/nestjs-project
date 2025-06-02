DATA_DIR=./my-data

up:
	@echo "Creating data directory if it doesn't exist..."
	mkdir -p $(DATA_DIR)
	@echo "Starting Docker Compose..."
	docker-compose -f ./infra/docker-compose.yaml up --build

down:
	docker-compose down

fclean : clean-images clean-volumes clean

clean:
	docker-compose down -v
	rm -rf $(DATA_DIR)

clean-images:
	-docker image rm -f $$(docker image ls -aq) || true

clean-containers:
	-docker container stop -f $$(docker container ls -aq) || true
	-docker container rm -f $$(docker container ls -aq) || true

clan-volumes :
	- docker volume rm $$( docker volume ls -q ) || true

logs:
	docker-compose logs -f

test:
	docker exec -it nest npm test

prune:
	docker system prune -f

prune-images:
	docker image prune -f

prune-volumes:
	docker volume prune -f

prune-containers:
	docker container prune -f

prune-networks:
	docker network prune -f
