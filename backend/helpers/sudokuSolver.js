const { random, floor, exp } = Math;
const math = require('mathjs');

var check = 0
let stuckTime = 0;

/* Extra function để chọn ngẫu nhiên một phần tử từ một dãy */
function choice(arr) {
    const randomIndex = floor(Math.random() * arr.length);
    return arr[randomIndex];
}


function printSudoku(sudoku) {
    for (let i = 0; i < sudoku.length; i++) {
        let line = '';
        if (i === 3 || i === 6) {
            console.log('---------------------');
        }
        for (let j = 0; j < sudoku[i].length; j++) {
            if (j === 3 || j === 6) {
                line += '| ';
            }
            line += `${sudoku[i][j]} `;
        }
        console.log(line);
    }
}

function fixSudokuValues(fixedSudoku) {  // CHECKED
    for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
            if (fixedSudoku[i][j] !== 0) {
                fixedSudoku[i][j] = 1;
            }
        }
    }
    return fixedSudoku;
}

function calculateNumberOfErrors(sudoku) {
    let numberOfErrors = 0;
    for (let i = 0; i < 9; i++) {
        numberOfErrors += calculateNumberOfErrorsRowColumn(i, i, sudoku);
    }
    return numberOfErrors;
}

function calculateNumberOfErrorsRowColumn(row, column, sudoku) {
    let numberOfErrors = (9 - [...new Set(sudoku.map(row => row[column]))].length) +
        (9 - [...new Set(sudoku[row])].length);
    return numberOfErrors;
}

function createList3x3Blocks() {
    const finalListOfBlocks = [];
    for (let r = 0; r < 9; r++) {
        const tmpList = [];
        const block1 = [...Array(3)].map((_, i) => i + 3 * (r % 3));
        const block2 = [...Array(3)].map((_, i) => i + 3 * Math.floor(r / 3));
        for (let x of block1) {
            for (let y of block2) {
                tmpList.push([x, y]);
            }
        }
        finalListOfBlocks.push(tmpList);
    }
    return finalListOfBlocks;
}

function randomlyFill3x3Blocks(sudoku, listOfBlocks) {
    for (let block of listOfBlocks) {
        for (let box of block) {
            if (sudoku[box[0]][box[1]] === 0) {
                const currentBlock = sudoku.slice(block[0][0], block[block.length - 1][0] + 1)
                    .map(row => row.slice(block[0][1], block[block.length - 1][1] + 1)).flat();
                sudoku[box[0]][box[1]] = choice([...Array(9).keys()].map(i => i + 1).filter(val => !currentBlock.includes(val)));
            }
        }
    }

    return sudoku;
}

function sumOfOneBlock(sudoku, oneBlock) {
    let finalSum = 0;
    for (let box of oneBlock) {
        finalSum += sudoku[box[0]][box[1]];
    }
    return finalSum;
}

function twoRandomBoxesWithinBlock(fixedSudoku, block) {
    while (true) {
        const firstIndex = floor(random() * block.length);
        let secondIndex;
        do {
            secondIndex = floor(random() * block.length);
        } while (secondIndex === firstIndex);

        const firstBox = block[firstIndex];
        const secondBox = block[secondIndex];

        if (fixedSudoku[firstBox[0]][firstBox[1]] !== 1 && fixedSudoku[secondBox[0]][secondBox[1]] !== 1) {
            return [firstBox, secondBox];
        }
    }
}

function flipBoxes(sudoku, boxesToFlip) {
    const proposedSudoku = JSON.parse(JSON.stringify(sudoku));

    const placeHolder = proposedSudoku[boxesToFlip[0][0]][boxesToFlip[0][1]];
    proposedSudoku[boxesToFlip[0][0]][boxesToFlip[0][1]] = proposedSudoku[boxesToFlip[1][0]][boxesToFlip[1][1]];
    proposedSudoku[boxesToFlip[1][0]][boxesToFlip[1][1]] = placeHolder;
    return proposedSudoku;
}

function proposedState(sudoku, fixedSudoku, listOfBlocks) {
    const randomBlock = choice(listOfBlocks);

    if (sumOfOneBlock(fixedSudoku, randomBlock) > 6) {
        return [sudoku, 1, 1];
    }
    const boxesToFlip = twoRandomBoxesWithinBlock(fixedSudoku, randomBlock);
    const proposedSudoku = flipBoxes(sudoku, boxesToFlip);

    return [proposedSudoku, boxesToFlip];
}

function chooseNewState(currentSudoku, fixedSudoku, listOfBlocks, sigma) {
    const proposal = proposedState(currentSudoku, fixedSudoku, listOfBlocks);

    const newSudoku = proposal[0];
    const boxesToCheck = proposal[1];

    var currentCost = calculateNumberOfErrorsRowColumn(boxesToCheck[0][0], boxesToCheck[0][1], currentSudoku)
        + calculateNumberOfErrorsRowColumn(boxesToCheck[1][0], boxesToCheck[1][1], currentSudoku)
    var newCost = calculateNumberOfErrorsRowColumn(boxesToCheck[0][0], boxesToCheck[0][1], newSudoku)
        + calculateNumberOfErrorsRowColumn(boxesToCheck[1][0], boxesToCheck[1][1], newSudoku)

    const costDifference = newCost - currentCost;
    const rho = exp(-costDifference / sigma);

    if (random() < rho) {
        return [newSudoku, costDifference];
    }

    return [currentSudoku, 0];
}

function chooseNumberOfIterations(fixedSudoku) {
    let numberOfIterations = 0;
    for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
            if (fixedSudoku[i][j] !== 0) {
                numberOfIterations++;
            }
        }
    }
    return numberOfIterations;
}

function calculateInitialSigma(sudoku, fixedSudoku, listOfBlocks) {
    const listOfDifferences = [];
    let tmpSudoku = sudoku;
    for (let i = 1; i < 10; i++) {
        tmpSudoku = proposedState(tmpSudoku, fixedSudoku, listOfBlocks)[0];
        listOfDifferences.push(calculateNumberOfErrors(tmpSudoku));
    }
    return math.std(listOfDifferences);
}


function solveSudoku(sudoku) {

    let solutionFound = 0;
    let tmpSudoku;

    while (solutionFound === 0) {
        const decreaseFactor = 0.99;
        let stuckCount = 0;
        const fixedSudoku = JSON.parse(JSON.stringify(sudoku)); 

        printSudoku(sudoku);
        console.log()
        fixSudokuValues(fixedSudoku);
        const listOfBlocks = createList3x3Blocks();
        tmpSudoku = randomlyFill3x3Blocks(sudoku, listOfBlocks);

        let sigma = calculateInitialSigma(sudoku, fixedSudoku, listOfBlocks);

        printSudoku(tmpSudoku)
        let score = calculateNumberOfErrors(tmpSudoku);
        const iterations = chooseNumberOfIterations(fixedSudoku);

        if (score <= 0) {
            solutionFound = 1;
        }

        while (solutionFound === 0) {
            const previousScore = score;
            for (let i = 0; i < iterations; i++) {
                const newState = chooseNewState(tmpSudoku, fixedSudoku, listOfBlocks, sigma);

                tmpSudoku = newState[0];
                let scoreDiff = newState[1];
                score += scoreDiff;

                if (score <= 0) {
                    solutionFound = 1;
                    break;
                }
            }

            sigma *= decreaseFactor;
            console.log('score:', score)

            if (score <= 0) {
                solutionFound = 1;
                break;
            }
            if (score >= previousScore) {
                stuckCount++;
            } else {
                stuckCount = 0;
            }
            if (stuckCount > 80) {
                stuckTime ++;
                check += 1
                sigma += 2;
            }
            if (calculateNumberOfErrors(tmpSudoku) === 0) {
                printSudoku(tmpSudoku);
                break;
            }
        }
    }
    return tmpSudoku;
}


module.exports = solveSudoku;