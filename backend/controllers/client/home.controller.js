const Leaderboard = require('../../models/leaderboard.model');

const SudokuSolver = require('../../helpers/sudokuSolver')

// [POST] /api/sudoku/
module.exports.sudokuPost = async (req, res) => {
  try {
    const solvedBoard = JSON.parse(JSON.stringify(req.body.board));
    const timeSolved = JSON.parse(JSON.stringify(req.body.timeSolved));

    const userExisted = await Leaderboard.findOne({ userName: req.body.userName })
    if (userExisted) {
      const update = {
        userName: req.body.userName,
        timeSolved: timeSolved,
        solvedBoard: solvedBoard,
        gameMode: req.body.gameMode
      };

      await userExisted.updateOne(update);

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

    res.send(true)
  } catch (error) {
    console.log('ERROR OCCURRED:', error);
  }
}

// [POST] /api/sudoku/create
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