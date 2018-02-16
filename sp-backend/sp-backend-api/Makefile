.PHONY: docker-build docker-run docker-clean docker-logs docker-save docker-upload

docker-save:
	docker save sketchpoints/sp-backend-api | bzip2 > _docker/sp-backend-api.tar.bzip

docker-upload:
	docker save sketchpoints/sp-backend-api | bzip2 | ssh sp-backend-manager 'bunzip2 | docker load'

docker-build:
	docker build -t sketchpoints/sp-backend-api .

docker-clean:
	docker rm sp-backend-api && \
	docker system prune

docker-logs:
	docker logs sp-backend-api

docker-stop:
	docker stop sp-backend-api

docker-run:
	docker run \
		-e "NODE_ENV=production" \
		-e "MONGO_URL=somepass" \
		-e "JWT_SECRET=somesecret" \
		-u "node" \
		-m "300M" --memory-swap "1G" \
		-w "/home/app/sp-backend-api" \
		-p 4000:4000 \
		--name "sp-backend-api" \
		-d sketchpoints/sp-backend-api