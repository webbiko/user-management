const logger = require("../controllers/logger.controller");
logger.init();

const express = require('express');
const axios = require('axios');
const helmet = require("helmet");
const morgan = require('morgan');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(helmet());
app.use(morgan('combined'));

require("../models/index");

require("../routes/user.routes")(app, axios);
module.exports = app;
module.exports.axios = axios;