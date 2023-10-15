const Firebase = require("../Firebase");

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

}

module.exports = ContestService;
