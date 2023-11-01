const Firebase = require("../Firebase");
const Authorization = require("../Authorization");
const {getContestResults} = require("../services/ContestService");
const ContestService = require("../services/ContestService");

class ContestController {

  static start(app) {

    // CREATE
    app.post("/api/v1/contest", async (request, response) => {
      if (!Authorization.userCanAccess(request.user)) { return response.status(403).send({}); }
      const contest = await Firebase.create("contests", request.body);
      response.send(contest);
    });

    // READ
    app.get("/api/v1/contest/:id", async (request, response) => {
      const contest = await Firebase.read("contests", request.params.id);
      if (!contest) { return response.status(404).send({}); }
      if (!Authorization.userCanAccess(request.user, contest, () => ContestService.isContestActive(request.user, contest))) { return response.status(403).send({}); }
      response.send(contest);
    });

    // UPDATE
    app.patch("/api/v1/contest/:id", async (request, response) => {
      let contest = await Firebase.read("contests", request.params.id);
      if (!contest) { return response.status(404).send({}); }
      if (!Authorization.userCanAccess(request.user, contest, () => ContestService.isContestActive(request.user, contest))) { return response.status(403).send({}); }
      contest = await Firebase.update("contests", contest.id, request.body);
      response.send(contest);
    });

    // DELETE
    app.delete("/api/v1/contest/:id", async (request, response) => {
      const contest = await Firebase.read("contests", request.params.id);
      if (!contest) { return response.status(404).send({}); }
      if (!Authorization.userCanAccess(request.user, contest, () => ContestService.isContestActive(request.user, contest))) { return response.status(403).send({}); }
      await Firebase.delete("contests", contest.id);
      response.send(contest);
    });

    // LIST
    app.get("/api/v1/contest", async (request, response) => {
      let contests = await Firebase.list("contests");
      contests = contests.filter(contest => Authorization.userCanAccess(request.user, contest, () => ContestService.isContestActive(request.user, contest)));
      response.send(contests);
    });

    app.get("/api/v1/contest/:id/result", async (request, response) => {
      const contest = await Firebase.read("contests", request.params.id);
      if (!contest) { return response.status(404).send({}); }
      // if (!Authorization.userCanAccess(request.user, contest, () => ContestController.isContestActive(contest))) { return response.status(403).send({}); }
      const {rows, columns} = await getContestResults(contest);
      response.send({rows, columns: ["name", ...columns]});
    });

    /*
[
  {
    "id": "X7IMMZjTz4hhTv8B5tB9TtsLlb43",
    "most_festive": "tFHjYrcnPDPOUTYXw0Qmm6lexiQ2",
    "best_tasting": "X7IMMZjTz4hhTv8B5tB9TtsLlb43",
    "best_looking": "X7IMMZjTz4hhTv8B5tB9TtsLlb43"
  },
  {
    "id": "tFHjYrcnPDPOUTYXw0Qmm6lexiQ2",
    "most_festive": "X7IMMZjTz4hhTv8B5tB9TtsLlb43",
    "best_tasting": "tFHjYrcnPDPOUTYXw0Qmm6lexiQ2",
    "best_looking": "X7IMMZjTz4hhTv8B5tB9TtsLlb43"
  }
]
     */

  }

}

module.exports = ContestController;
