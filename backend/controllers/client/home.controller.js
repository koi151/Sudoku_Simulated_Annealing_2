const Ranking = require('../../models/ranking.model');

const SudokuSolver = require('../../helpers/sudokuSolver')

// [GET] /api
module.exports.index = async (req, res) => {
  try {
    const sudoku = await Ranking.findAll({
      
    })
    
    res.send(sudoku);
  } catch (error) {
    console.log('ERROR OCCURRED:', error);
  }
} 


// [POST] /api/sudoku/
module.exports.sudokuPost = async (req, res) => {
  try {
    const solvedBoard = JSON.parse(JSON.stringify(req.body.board));
    const timeSolved = JSON.parse(JSON.stringify(req.body.timeSolved));

    const userExisted = Ranking.findOne({ userName: req.body.userName })
    if (userExisted) {
      const update = {
        userName: req.body.userName,
        timeSolved: timeSolved
      };
      userExisted.updateOne(update);

    } else {
      const sudokuObject = {
        userName: req.body.userName,
        timeSolved: timeSolved,
        gameMode: req.body.gameMode,
        solvedBoard: solvedBoard,
        createAt: new Date()
      }

      const newSudoku = new Ranking(sudokuObject);
      await newSudoku.save();
      
    }
    
    

  } catch (error) {
    console.log('ERROR OCCURRED:', error);
  }
}

// [POST] /api//sudoku/create
module.exports.sudokuSolve = async (req, res) => {
  try {
    console.log('solve');

    const solvedBoard = await SudokuSolver(req.body.board);

    // await Sudoku.updateOne(
    //   {_id: req.body.id },
    //   { solvedBoard: solvedBoard }
    // )

    console.log('solved');
    res.send(solvedBoard);

  } catch (error) {
    console.log('ERROR OCCURRED:', error);
  }
}

// [PATCH] /api//sudoku/create
module.exports.sudokuPatch = async (req, res) => {
  try {
    console.log('solve');
    // console.log('id:', req.body.id);

    const solvedBoard = await SudokuSolver(req.body.board);

    // await Sudoku.updateOne(
    //   {_id: req.body.id },
    //   { solvedBoard: solvedBoard }
    // )

    console.log('solved');
    res.send(solvedBoard);

  } catch (error) {
    console.log('ERROR OCCURRED:', error);
  }
}
