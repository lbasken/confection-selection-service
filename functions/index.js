const {onRequest} = require("firebase-functions/v2/https");
const admin = require("firebase-admin");
const express = require("express");
const cors = require("cors");

const firebase = admin.initializeApp();

const app = express();
app.use(cors());

app.get("/user", async (request, response) => {
    const snapshot = await firebase.firestore().collection("users").get();
    const users = snapshot.docs.map(document => document.data());
    response.send(users);
});

app.get("/user/:id", async (request, response) => {
    const snapshot = await firebase.firestore().collection("users").doc(request.params.id).get();
    response.send(snapshot.data());
});

exports.api = onRequest(app);
