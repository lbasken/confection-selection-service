const {onRequest} = require("firebase-functions/v2/https");
const express = require("express");
const cors = require("cors");
const UserController = require("./src/controllers/UserController");
const ContestController = require("./src/controllers/ContestController");
const UserMiddleware = require("./src/middleware/UserMiddleware");

const app = express();
app.use(cors());
app.use(UserMiddleware.filter);

UserController.start(app);
ContestController.start(app);

// app.get("/contestant", async (request, response) => {
//     const snapshot = await firebase.firestore().collection("contestants").get();
//     const contestants = snapshot.docs.map(document => document.data());
//     response.send(contestants);
// });
//
// app.get("/contestant/:id", async (request, response) => {
//     const snapshot = await firebase.firestore().collection("contestants").doc(request.params.id).get();
//     response.send(snapshot.data());
// });
//
// app.get("/newsfeed", async (request, response) => {
//     const snapshot = await firebase.firestore().collection("newsfeed").get();
//     const newsfeed = snapshot.docs.map(document => document.data());
//     response.send(newsfeed);
// });
//
// app.get("/newsfeed/:id", async (request, response) => {
//     const snapshot = await firebase.firestore().collection("newsfeed").doc(request.params.id).get();
//     response.send(snapshot.data());
// });

exports.api = onRequest(app);
