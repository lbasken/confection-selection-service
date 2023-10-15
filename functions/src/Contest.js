const Firebase = require("./Firebase");
const Authorization = require("./Authorization");

class Contest {

  static start(app) {

    // CREATE
    app.post("/api/v1/contest", async (request, response) => {
      if (!Authorization.can(request.user)) { return response.status(403).send({}); }
      const contest = await Firebase.create("contests", request.body);
      response.send(contest);
    });

    // READ
    app.get("/api/v1/contest/:id", async (request, response) => {
      const contest = await Firebase.read("contests", request.params.id);
      if (!contest) { return response.status(404).send({}); }
      if (!Authorization.can(request.user, contest, () => Contest.isContestActive(contest))) { return response.status(404).send({}); }
      response.send(contest);
    });

    // UPDATE
    app.patch("/api/v1/contest/:id", async (request, response) => {
      let contest = await Firebase.read("contests", request.params.id);
      if (!contest) { return response.status(404).send({}); }
      if (!Authorization.can(request.user, contest, () => Contest.isContestActive(contest))) { return response.status(404).send({}); }
      contest = await Firebase.update("contests", contest.id, request.body);
      response.send(contest);
    });

    // DELETE
    app.delete("/api/v1/contest/:id", async (request, response) => {
      const contest = await Firebase.read("contests", request.params.id);
      if (!contest) { return response.status(404).send({}); }
      if (!Authorization.can(request.user, contest, () => Contest.isContestActive(contest))) { return response.status(404).send({}); }
      await Firebase.delete("contests", contest.id);
      response.send(contest);
    });

    // LIST
    app.get("/api/v1/contest", async (request, response) => {
      let contests = await Firebase.list("contests");
      contests = contests.filter(contest => Authorization.can(request.user, contest, () => Contest.isContestActive(contest)));
      response.send(contests);
    });

  }

  static isContestActive(contest) {
    if (contest.active === false) { return false; } // if the contest has been forced to be inactive
    if (!contest.start || !contest.end) { return false; } // if the contest doesn't have a start and stop, something's wrong
    const now = Date.now();
    return now >= contest.start && now <= contest.end; // check if contest is still "running"
  }

}

module.exports = Contest;
