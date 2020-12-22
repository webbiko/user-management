requirement : npm i sequelize-cli

docker pull mysql

docker run --name mb-mysql -e MYSQL_ROOT_PASSWORD=root -e MYSQL_DATABASE=dev -e MYSQL_USER=root -e MYSQL_PASSWORD=root -d mysql:latest

update config.json with the new docker ip address

npm run migrate:test

MYSQL_URL_CONNECTION=<docker_ip_address> npx jest --coverage --runInBand --forceExit
