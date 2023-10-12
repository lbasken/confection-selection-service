const {onRequest} = require("firebase-functions/v2/https");
const admin = require("firebase-admin");
const express = require("express");
const cors = require("cors");

const firebase = admin.initializeApp();

const app = express();
app.use(cors());

app.get("/contestant", async (request, response) => {
    const snapshot = await firebase.firestore().collection("contestants").get();
    const contestants = snapshot.docs.map(document => document.data());
    response.send(contestants);
});

app.get("/contestant/:id", async (request, response) => {
    const snapshot = await firebase.firestore().collection("contestants").doc(request.params.id).get();
    response.send(snapshot.data());
});

app.get("/newsfeed", async (request, response) => {
    const snapshot = await firebase.firestore().collection("newsfeed").get();
    const newsfeed = snapshot.docs.map(document => document.data());
    response.send(newsfeed);
});

app.get("/newsfeed/:id", async (request, response) => {
    const snapshot = await firebase.firestore().collection("newsfeed").doc(request.params.id).get();
    response.send(snapshot.data());
});

app.get("/contests", async (request, response) => {
    const snapshot = await firebase.firestore().collection("contests").get();
    const contests = snapshot.docs.map(document => document.data());
    response.send(contests);
});

app.get("/contests/:id", async (request, response) => {
    const snapshot = await firebase.firestore().collection("contests").doc(request.params.id).get();
    response.send(snapshot.data());
});

exports.api = onRequest(app);
