const Firebase = require("../services/Firebase");
const Authorization = require("../services/Authorization");
const ContestService = require("../services/ContestService");

class ContestController {

  static start(app) {

    // CREATE
    app.post("/api/v1/contest", async (request, response) => {
      if (!Authorization.userCanAccess(request.user)) { return response.status(403).send({}); }
      const data = JSON.parse(JSON.stringify(request.body));
      delete data.id;
      data.created_at = Date.now();
      data.created_by = request.user.email;
      data.updated_at = data.created_at;
      data.updated_by = data.created_by;
      const contest = await Firebase.create("contests", data);
      response.send(contest);
    });

    // READ categories for a contest
    app.get("/api/v1/contest/:id/categories", async (request, response) => {
      const contest = await Firebase.read("contests", request.params.id);
      if (!contest) { return response.status(404).send({}); }
      if (!Authorization.userCanAccess(request.user, contest, () => ContestService.isContestActive(request.user, contest))) { return response.status(403).send({}); }
      response.send(ContestService.getContestCategories(contest));
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
      const data = JSON.parse(JSON.stringify(request.body));
      delete data.id;
      delete data.votes;
      data.updated_at = Date.now();
      data.updated_by = request.user.email;
      contest = await Firebase.update("contests", contest.id, data);
      response.send(contest);
    });

    // DELETE
    app.delete("/api/v1/contest/:id", async (request, response) => {
      let contest = await Firebase.read("contests", request.params.id);
      if (!contest) { return response.status(404).send({}); }
      if (!Authorization.userCanAccess(request.user, contest, () => ContestService.isContestActive(request.user, contest))) { return response.status(403).send({}); }
      contest.deleted = true;
      contest = await Firebase.update("contests", contest.id, contest);
      response.send(contest);
    });

    // LIST (all contests, for use by admins)
    app.get("/api/v1/contest", async (request, response) => {
      const contests = await ContestService.getContests(request.user, true);
      response.send(contests);
    });

    // LIST (only live contests, for use by regular users)
    app.get("/api/v1/contest_live", async (request, response) => {
      const contests = await ContestService.getContests(request.user, false);
      response.send(contests);
    });

    // Tally up the votes for a contest
    app.get("/api/v1/contest/:id/result", async (request, response) => {
      const contest = await Firebase.read("contests", request.params.id);
      if (!contest) { return response.status(404).send({}); }
      if (!Authorization.userCanAccess(request.user, contest, () => ContestController.isContestActive(contest))) { return response.status(403).send({}); }
      const {rows, columns, winners} = await ContestService.getContestResults(contest);
      response.send({rows, columns: ["name", ...columns], winners});
    });

    // Add (or update) a user's votes for a contest
    app.patch("/api/v1/contest/:id/vote", async (request, response) => {
      const contest = await Firebase.read("contests", request.params.id);
      if (!contest || contest.deleted | !contest.visible) { return response.status(404).send({}); }
      const votes = JSON.parse(JSON.stringify(request.body));
      delete votes.id;
      await Firebase.set(`contests/${request.params.id}/votes`, request.user.uid, votes);
      // update contest so we get an update notification in UI
      const id = contest.id;
      delete contest.id;
      contest.updated_at = Date.now();
      await Firebase.update("contests", id, contest);
      response.send(contest);
    });

  }

}

module.exports = ContestController;
