const Firebase = require("../services/Firebase");

class EventsController {

  static start(app) {

    app.get("/api/v1/events", (request, response) => {
      response.setHeader("Content-Type", "text/event-stream");
      response.setHeader("Cache-Control", "no-cache");
      response.setHeader("Connection", "keep-alive");
      response.setHeader("X-Accel-Buffering", "no");

      const unsubscribe = Firebase.firestore.collection("contests").onSnapshot(snapshot => {
        const changes = snapshot.docChanges().map(change => ({id: change.doc.ref.id, type: change.type}));
        for (const change of changes) {
          EventsController.send(response, {type: "contest", change: change.type, id: change.id});
        }
      });

      EventsController.ping(response);
      const interval = setInterval(() => {EventsController.ping(response)}, 30000);

      request.on("close", () => {
        console.log("close", unsubscribe);
        unsubscribe();
        clearInterval(interval);
        response.destroy();
      });
    });

  }

  static ping(response) {
    EventsController.send(response, {type: "ping"});
  }

  static send(response, message) {
    message.timestamp = message.timestamp ?? Date.now();
    response.write(`data: ${JSON.stringify(message)}\n\n`);
  }

}

module.exports = EventsController;
