const express = require('express');
const router = express.Router();

const controller = require('../../controllers/client/home.controller');

router.get('/', controller.index);

router.post('/sudoku/create', controller.sudokuPost);

router.patch('/sudoku/solve', controller.sudokuSolve);

module.exports = router;