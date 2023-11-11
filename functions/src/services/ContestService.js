const Firebase = require("./Firebase");
const Authorization = require("./Authorization");

class ContestService {

  static async getContestResults(contest) {
    const votes = await Firebase.list(`contests/${contest.id}/votes`);

    let columns = {};

    const tally = votes.reduce((tally, vote) => {
      const uid = vote.id;
      delete vote.id;
      Object.keys(vote).forEach(category_id => {
        const entry = vote[category_id];
        columns[category_id] = 0;
        if (!tally[category_id]) { tally[category_id] = {}; }
        if (!tally[category_id][entry.entry]) { tally[category_id][entry.entry] = {count: 0, voters: []}; }
        tally[category_id][entry.entry].count++;
        tally[category_id][entry.entry].voters.push(uid);
      });
      return tally;
    }, {});

    columns = Object.keys(columns);

    const rows = contest.entries
      .map(entry => ({
        name: entry.entry,
        ...columns.reduce((categories, category) => ({...categories, [category]: {count: tally[category][entry.entry]?.count ?? 0, voters: tally[category][entry.entry]?.voters ?? []}}), {})
      }));

    const winners = columns.reduce((winners, column) => ({...winners, [column]: {count: 0, entrants: []}}), {});
    for (const row of rows) {
      for (const category of columns) {
        if (row[category].count > winners[category].count) {
          winners[category].count = row[category].count;
          winners[category].entrants = [row.name];
        } else if (row[category].count === winners[category].count) {
          winners[category].entrants.push(row.name);
        }
      }
    }
    for (const [category, winner] of Object.entries(winners)) {
      if (winner.entrants.length === 0) { winner.outcome = "no_votes"; }
      if (winner.entrants.length === 1) { winner.outcome = "winner"; }
      if (winner.entrants.length > 1) { winner.outcome = "tie"; }
    }

    return {votes, tally, columns, rows, winners};
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
      contest.votes = (await Firebase.read(`contests/${contest.id}/votes`, user.uid)) ?? {};
    }
    return contests;
  }

}

module.exports = ContestService;
