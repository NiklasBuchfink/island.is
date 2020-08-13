#!/bin/bash
set -euxo pipefail

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"

source $DIR/_common.sh

RUNNER=test-runner
APP_HOME=`cat $PROJECT_ROOT/workspace.json | jq ".projects[\"$APP\"].root" -r`

docker image inspect ${DOCKER_REGISTRY}${RUNNER}:${DOCKER_TAG} -f ' ' || \
  docker buildx build \
  --platform=linux/amd64 \
  --cache-from=type=local,src=$PROJECT_ROOT/cache \
  -f ${DIR}/Dockerfile \
  --target=test \
  --load \
  --build-arg BUILDKIT_INLINE_CACHE=1 \
  -t ${DOCKER_REGISTRY}${RUNNER}:${DOCKER_TAG} \
  $PROJECT_ROOT

# Checking if we should simple run the test runner container or should we use a docker-compose setup
if [ -f $PROJECT_ROOT/$APP_HOME/docker-compose.ci.yml ]; then
  COMPOSE_FILES="-f $PROJECT_ROOT/$APP_HOME/docker-compose.ci.yml"
  
  if [ -f $PROJECT_ROOT/$APP_HOME/docker-compose.base.yml ]; then
    COMPOSE_FILES="-f $PROJECT_ROOT/$APP_HOME/docker-compose.base.yml $COMPOSE_FILES"
  fi

  # Cleanup after the test 
  clean_up () {
    SUT=${DOCKER_REGISTRY}${RUNNER}:${DOCKER_TAG} docker-compose -p test-$APP $COMPOSE_FILES rm -s -f
  } 
  trap clean_up EXIT

  # Running the tests using docker-compose
  SUT=${DOCKER_REGISTRY}${RUNNER}:${DOCKER_TAG} docker-compose -p test-$APP $COMPOSE_FILES run --rm sut
else
  # Standalone execution of tests when no external dependencies are needed (DBs, queues, etc.)
  exec docker run \
    --rm \
    --net=host \
    -e APPLICATION_DB_HOST \
    -e APPLICATION_TEST_DB_USER \
    -e APPLICATION_TEST_DB_PASS \
    -e APPLICATION_TEST_DB_NAME \
    -e APP=$APP \
    ${DOCKER_REGISTRY}${RUNNER}:${DOCKER_TAG}
fi
