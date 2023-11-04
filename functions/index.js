const {onRequest} = require("firebase-functions/v2/https");
const express = require("express");
const cors = require("cors");
const UserController = require("./src/controllers/UserController");
const ContestController = require("./src/controllers/ContestController");
const UserMiddleware = require("./src/middleware/UserMiddleware");
const EventsController = require("./src/controllers/EventsController");

const app = express();
app.use(cors());
app.use(UserMiddleware.filter);

UserController.start(app);
ContestController.start(app);
EventsController.start(app);

exports.api = onRequest(app);
