const Firebase = require("../Firebase");
const Authorization = require("../Authorization");

class ContestService {

  static async getContestResults(contest) {
    const votes = await Firebase.list(`contests/${contest.id}/votes`);
    let columns = {};
    const tally = votes.reduce((tally, vote) => {
      delete vote.id;
      Object.keys(vote).forEach(key => {
        const id = vote[key];
        columns[key] = 0;
        if (!tally[key]) { tally[key] = {}; }
        if (!tally[key][id]) { tally[key][id] = 0; }
        tally[key][id]++;
      });
      return tally;
    }, {});
    columns = Object.keys(columns);
    const rows = contest.entries.map(entry => {
      return {
        name: entry.name,
        ...columns.reduce((a, category) => ({...a, [category]: tally[category][entry.uid] ?? 0}), {})
      };
    });
    return {votes, tally, columns, rows};
  }

  static isContestActive(user, contest) {
    if (contest.active === false) { return false; } // if the contest has been forced to be inactive
    if (!contest.start_date || !contest.end_date) { return false; } // if the contest doesn't have a start and stop, something's wrong
    if (!Array.isArray(contest.judges)) { return false; } // no judges array, cannot be active
    if (!contest.judges.includes(user.uid)) { return false; }
    const now = Date.now();
    return now >= contest.start_date && now <= contest.end_date; // check if contest is still "running"
  }

  static async getContests(user, showHidden) {
    let contests = await Firebase.list("contests");
    contests = contests.filter(contest => !contest.deleted);
    if (!showHidden) { contests = contests.filter(contest => contest.visible); }
    contests = contests.filter(contest => Authorization.userCanAccess(user, contest, () => ContestService.isContestActive(user, contest)));
    for (const contest of contests) {
      contest.votes = await Firebase.read(`contests/${contest.id}/votes`, user.uid);
    }
    return contests;
  }

}

module.exports = ContestService;
