PROJECT_DIR ?= $(dir $(realpath $(lastword $(MAKEFILE_LIST))))
DOCKER_RUN_USER_ID ?= $(id -u ${USER})
DOCKER_RUN_GROUP_ID ?= $(id -g ${USER})

check_defined = \
    $(strip $(foreach 1,$1, \
        $(call __check_defined,$1,$(strip $(value 2)))))
__check_defined = \
    $(if $(value $1),, \
      $(error Undefined $1$(if $2, ($2))))


.ONESHELL: install
.PHONY: install
install:
	@docker run --rm -i -v $(PROJECT_DIR):/app -w /app -u $(DOCKER_RUN_USER_ID):$(DOCKER_RUN_GROUP_ID) -e NPM_CONFIG_PREFIX:/tmp node:20-alpine3.19 /bin/sh -s << EOF
		npm i
		npx prisma generate
	EOF

.ONESHELL: test
.PHONY: test
test: install
test:
	@docker run --rm -i -v $(PROJECT_DIR):/app -w /app -u $(DOCKER_RUN_USER_ID):$(DOCKER_RUN_GROUP_ID) -e NPM_CONFIG_PREFIX:/tmp node:20-alpine3.19 /bin/sh -s << EOF
		npm i
		npm run test
	EOF

.PHONY: compose
compose:
	@docker compose -f docker-compose.yml -f docker/docker-compose.env.yml up --build
