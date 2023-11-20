const Leaderboard = require('../../models/leaderboard.model');

// [GET] /api/ranking
module.exports.index = async (req, res) => {
  try {
    const searchCriterias = {
      deleted: false
    }

    if (req.query.gameMode) {
      searchCriterias.gameMode = req.query.gameMode
    }
    
    let sort = {};
    sort.timeSolved = 1; // asc timeSolved
    console.log(sort)
    /*
    { timeSolved: 'desc' }
    */

    const sudoku = await Leaderboard.find(searchCriterias).sort(sort);
    
    res.send(sudoku);

  } catch (error) {
    console.log('ERROR OCCURRED:', error);
  }
} 
