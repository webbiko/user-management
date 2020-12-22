## Overview

This project is part of a series of microservices that are in my repository in order to guide other developer regarding micro-services architecture in nodejs and on its group of services it will be included:

1. **development-tool** => This project supports the developer to setup easily the (mongodb, mysql) databases which is used on this solution.
2. **token** => It is a JWT token service which is used to control access to the main api acronyms.
3. **user-management** => In order to use the apis that are not public it is needed to have a user and this service provides basic api routes which allows us to create the credentials.
4. **acronym** => This is the core of this solution and provide acronyms.

---

## Requirements

*The project was developed on ubuntu 18.04 and all the instructions in this guide are based on this linux distribution.*
Before proceeding it is needed that you have installed on your machine the following tools:

1. nodejs => apt-get install nodejs
2. npm => apt-get install npm
3. [Docker](https://docs.docker.com/engine/install/ubuntu/)
4. [Docker compose](https://docs.docker.com/compose/install/)

**PS:** It may be needed that you have to install some npm packages that are not installed as part of the project but globally:

1. [enc-cmd](https://www.npmjs.com/package/env-cmd)
2. [sequelize-cli](https://www.npmjs.com/package/sequelize-cli)

---

## Env variables

In order to execute this project smoothly it is necessary to create a a file called **.env-cmdrc** with the following structure:

```json
{
  "development": {
    "NODE_ENV": "development",
    "SERVICE_PORT": 3004,
    "TOKEN_SERVICE_URL": "localhost",
    "TOKEN_SERVICE_PORT": 3002,
    "SEND_EMAIL": false,
    "API_RATE_LIMIT": 1000000
  },
  "stage": {
    "NODE_ENV": "stage",
    "SERVICE_PORT": 3004,
    "EMAIL_USER": "",
    "EMAIL_PASSWORD": "",
    "TOKEN_SERVICE_URL": "localhost",
    "TOKEN_SERVICE_PORT": 3002,
    "SEND_EMAIL": true,
    "API_RATE_LIMIT": 10
  },
  "test": {
    "NODE_ENV": "test",
    "SERVICE_PORT": 3004,
    "TOKEN_SERVICE_URL": "localhost",
    "TOKEN_SERVICE_PORT": 3002,
    "SEND_EMAIL": false,
    "API_RATE_LIMIT": 1000000
  },
  "production": {
    "NODE_ENV": "production",
    "SERVICE_PORT": 3004,
    "EMAIL_USER": "",
    "EMAIL_PASSWORD": "",
    "TOKEN_SERVICE_URL": "localhost",
    "TOKEN_SERVICE_PORT": 3002,
    "SEND_EMAIL": true,
    "API_RATE_LIMIT": 10,
    "NEWRELIC_TOKEN": "yourNewRelicToken",
    "NEW_RELIC_LOG_LEVEL": "error"
  }
}

```

Also a file called **.sequelizerc** is required with the following structure:

```javascript
const path = require('path');

module.exports = {
    'config': path.resolve('./app/db/config', 'config.json'),
    'models-path': path.resolve('./app', 'models'),
    'seeders-path': path.resolve('./app/db', 'seeders'),
    'migrations-path': path.resolve('./app/db', 'migrations')
};
```
---

## Running the project in development mode

In order to run the project in development mode it is required to execute the steps below:

1. Access the project development-tool/setup;
2. Grant execution permission to setup.sh: **chmod +x setup.sh**;
3. Execute the script: ./setup.sh. (This will build all required docker images and launch them);
4. docker ps and you should see all docker images up and running.

After the steps above it is necessary to check which ip address which database is running and to do check that out follow the steps belo:

### User management (MYSQL)
1. As result of command **docker ps** copy the CONTAINER_ID;
2. Execute docker inspect <CONTAINER_ID> and you should see in the end of the output just look for the tah "Networks => IPAddress" then copy it.
3. Access the project user-management;
4. Execute npm install;
5. Edit the file config.json and past the IP address on host env variable;
6. In the root folder of project user-management execute on terminal:
	- npm run migrate:dev;
	- npm run dev

After the steps about the service should be up and running on port 3004.

---

## Running tests

In order to run the tests it is required to execute the steps below:

1. Access the project development-tool/setup;
2. Grant execution permission to setup.sh: **chmod +x setup.sh**;
3. Execute the script: ./setup.sh. (This will build all required docker images and launch them);
4. docker ps and you should see all docker images up and running.

After the steps above it is necessary to check which ip address which database is running and to do check that out follow the steps belo:

### User management (MYSQL)

1. As result of command **docker ps** copy the CONTAINER_ID;
2. Execute docker inspect <CONTAINER_ID> and you should see in the end of the output just look for the tah "Networks => IPAddress" then copy it.
3. Access the project user-management;
4. Execute npm install;
5. Edit the file config.json and past the IP address on host env variable on test environment;
6. In the root folder of project user-management execute on terminal:
	- npm run migrate:test;
	- npm run test

## Production System Design suggestion

In order to deploy on production a good way to go it would be preserving the micro services behind a reverse proxy and Nginx is a good candidate since it distribute the traffic in a simple way and provide all the support for easy loading balance in case we need.
Below we can see the picture:

https://drive.google.com/file/d/11IMGAWzKxtOQ-iAC1m5oncb-PkJ750Nf/view?usp=sharing

The communication among the services are all in HTTP and are closed for the outside and the only way to communicate with the servier is through nginx.

---

## Monitoring tool

Monitoring the health, downtime and how your servier is reacting in production is really important so NewRelic was chosen as monitoring tool and it is integrated in the solution.
It only monitors production environment and it was tested pointing to development environment.

Check it out: https://login.newrelic.com/login?
Username: someemail@gmail.com
Password: *******

---
