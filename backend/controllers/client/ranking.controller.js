const Ranking = require('../../models/ranking.model');

// [GET] /api/ranking
module.exports.index = async (req, res) => {
  try {
    const sudoku = await Ranking.find();
    
    res.send(sudoku);
  } catch (error) {
    console.log('ERROR OCCURRED:', error);
  }
} 
