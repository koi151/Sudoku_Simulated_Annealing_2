const { random, floor, exp } = Math;
const math = require('mathjs'); 

let stuckTime = 0;

/* Chọn ngẫu nhiên một phần tử từ mảng */
function choice(arr) {
    const randomIndex = floor(Math.random() * arr.length);
    return arr[randomIndex];
}
// In bảng sudoku phía backend
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
// Đánh dấu ô đã được điền giá trị hay chưa
function fixSudokuValues(fixedSudoku) { 
    for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
            if (fixedSudoku[i][j] !== 0) {
                fixedSudoku[i][j] = 1;
            }
        }
    }
    return fixedSudoku;
}
// Tính tổng số lỗi trong hàng và cột 
function calculateNumberOfErrorsRowColumn(row, column, sudoku) {
  let numberOfErrors = (9 - [...new Set(sudoku.map(row => row[column]))].length) +
      (9 - [...new Set(sudoku[row])].length);
  return numberOfErrors;
}
// Tính tổng số lỗi trong toàn bộ Sudoku
function calculateNumberOfErrors(sudoku) {
    let numberOfErrors = 0;
    for (let i = 0; i < 9; i++) {
        numberOfErrors += calculateNumberOfErrorsRowColumn(i, i, sudoku);
    }
    return numberOfErrors;
}
// Tạo danh sách các tọa độ đại diện cho các khối 3x3 trong bảng Sudoku
function createList3x3Blocks() {
    const finalListOfBlocks = [];

    for (let r = 0; r < 9; r++) {
        const tmpList = [];

        // Tạo mảng 3 phần tử đại diện cho hàng  
        const block1 = [...Array(3)].map((_, i) => i + 3 * (r % 3));

        // Tạo mảng 3 phần tử đại diện cho cột  
        const block2 = [...Array(3)].map((_, i) => i + 3 * Math.floor(r / 3));

        for (let x of block1) {
            for (let y of block2) {
                tmpList.push([x, y]); // Add cells coordinate into list
            }
        }

        finalListOfBlocks.push(tmpList);
    }
    return finalListOfBlocks;
}
// Điền ngẫu nhiên các số không trùng lặp vào khối 3x3 
function randomlyFill3x3Blocks(sudoku, listOfBlocks) {
    for (let block of listOfBlocks) { // listOfBlocks bao gồm danh sách chứa cặp tọa độ (row, col)
        for (let box of block) {
            if (sudoku[box[0]][box[1]] === 0) {
                const currentBlock = sudoku.slice(block[0][0], block[block.length - 1][0] + 1) // chọn các dòng của Sudoku nằm trong khoảng từ dòng đầu tiên của khối 3x3 đến dòng cuối cùng
                    .map(row => row.slice(block[0][1], block[block.length - 1][1] + 1)).flat(); // duyệt qua từng dòng đã chọn và chọn các giá trị trong khoảng từ cột đầu tiên đến cột cuối cùng của khối 3x3.
                sudoku[box[0]][box[1]] = choice([...Array(9).keys()].map(i => i + 1).filter(val => !currentBlock.includes(val)));
            }
        }
    }

    return sudoku;
}
// Tổng các giá trị trong 1 khối
function sumOfOneBlock(sudoku, oneBlock) {
    let finalSum = 0;
    for (let box of oneBlock) {
        finalSum += sudoku[box[0]][box[1]];
    }
    return finalSum;
}
// Chọn ngẫu nhiên 2 ô thỏa điều kiện và hoán đổi
function twoRandomBoxesWithinBlock(fixedSudoku, block) {
    while (true) {
        const firstIndex = floor(random() * block.length);
        let secondIndex;
        do {
            secondIndex = floor(random() * block.length);
        } while (secondIndex === firstIndex); // chọn ngẫu nhiên 2 index không trùng nhau trong khối

        const firstBox = block[firstIndex];
        const secondBox = block[secondIndex];

        if (fixedSudoku[firstBox[0]][firstBox[1]] !== 1 && fixedSudoku[secondBox[0]][secondBox[1]] !== 1) {
            return [firstBox, secondBox];
        }
    }
}
// Thực hiện việc đổi chỗ giữa giá trị của hai ô được chọn trong bảng Sudoku
function flipBoxes(sudoku, boxesToFlip) {
    const proposedSudoku = JSON.parse(JSON.stringify(sudoku));

    const placeHolder = proposedSudoku[boxesToFlip[0][0]][boxesToFlip[0][1]];
    proposedSudoku[boxesToFlip[0][0]][boxesToFlip[0][1]] = proposedSudoku[boxesToFlip[1][0]][boxesToFlip[1][1]];
    proposedSudoku[boxesToFlip[1][0]][boxesToFlip[1][1]] = placeHolder;
    return proposedSudoku;
}
// Đề xuất trạng thái mới
function proposedState(sudoku, fixedSudoku, listOfBlocks) {
    const randomBlock = choice(listOfBlocks);
    if (sumOfOneBlock(fixedSudoku, randomBlock) > 7) { 
        return [sudoku, 1, 1];
    }

    const boxesToFlip = twoRandomBoxesWithinBlock(fixedSudoku, randomBlock); // mảng chứa tọa độ 2 ô cần flip
    const proposedSudoku = flipBoxes(sudoku, boxesToFlip);

    return [proposedSudoku, boxesToFlip];
}
/* Chịu trách nhiệm quyết định chấp nhận một trạng thái đề xuất.
Tính toán sự chênh lệch chi phí giữa trạng thái hiện tại và trạng thái đề xuất,
dựa trên rho để xác định xem có chuyển sang trạng thái mới hay không.  */
function chooseNewState(currentSudoku, fixedSudoku, listOfBlocks, sigma) {

    // gọi hàm đề xuất một trạng thái mới dựa trên trạng thái hiện tại
    const proposal = proposedState(currentSudoku, fixedSudoku, listOfBlocks);
    if (proposal[1] === 1 && proposal[2] === 1)
        return [currentSudoku, 0];


    const newSudoku = proposal[0];
    const boxesToCheck = proposal[1];

    var currentCost = calculateNumberOfErrorsRowColumn(boxesToCheck[0][0], boxesToCheck[0][1], currentSudoku)
        + calculateNumberOfErrorsRowColumn(boxesToCheck[1][0], boxesToCheck[1][1], currentSudoku)
    var newCost = calculateNumberOfErrorsRowColumn(boxesToCheck[0][0], boxesToCheck[0][1], newSudoku)
        + calculateNumberOfErrorsRowColumn(boxesToCheck[1][0], boxesToCheck[1][1], newSudoku)

    const costDifference = newCost - currentCost;

    // biểu diễn xác suất dựa trên sự chênh lệch về chi phí giữa trạng thái mới và trạng thái hiện tại.
    const rho = exp(-costDifference / sigma); 

    if (random() < rho) { // quyết định dựa trên xác suất giúp giảm cơ hội mắc kẹt ở các local minimum
        return [newSudoku, costDifference];
    }

    return [currentSudoku, 0];
}
// Quyết định số lần lặp cần thiết để giải Sudoku dựa trên các ô đã được điền sẵn
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
// tính giá trị sigma khởi tạo dưa trên độ lệch chuẩn của 10 trạng thái đề xuất từ trạng thái ban đầu
function calculateInitialSigma(sudoku, fixedSudoku, listOfBlocks) {
    const listOfDifferences = []; 
    let tmpSudoku = sudoku;
    for (let i = 1; i <= 10; i++) {
        tmpSudoku = proposedState(tmpSudoku, fixedSudoku, listOfBlocks)[0]; // listOfBlocks: danh sách các tọa độ đại diện cho các khối 3x3 trong bảng Sudoku
        listOfDifferences.push(calculateNumberOfErrors(tmpSudoku));
    }
    return math.std(listOfDifferences);
}
/* Giải sudoku bằng TTMPLK, thuật toán lặp đi lặp lại, đề xuất các trạng thái mới và chấp nhận hoặc từ chối
dựa trên một tiêu chí xác suất cho đến khi tìm thấy giải pháp */
function solveSudoku(sudoku) {
  let solutionFound = 0;
  let tmpSudoku;

  while (solutionFound === 0) {
    const decreaseFactor = 0.99; // hằng số giảm nhiệt độ sigma
    let stuckCount = 0;
    const fixedSudoku = JSON.parse(JSON.stringify(sudoku)); 

    printSudoku(sudoku);
    console.log()

    fixSudokuValues(fixedSudoku);
    // Tạo danh sách các tọa độ đại diện cho các khối 3x3 trong bảng Sudoku
    const listOfBlocks = createList3x3Blocks(); 
    tmpSudoku = randomlyFill3x3Blocks(sudoku, listOfBlocks); 

    let sigma = calculateInitialSigma(sudoku, fixedSudoku, listOfBlocks);

    printSudoku(tmpSudoku)

    let score = calculateNumberOfErrors(tmpSudoku);
    const iterations = chooseNumberOfIterations(fixedSudoku);

    if (score <= 0) {
        printSudoku(sudoku)
        solutionFound = 1;
    }

    while (solutionFound === 0) {
      const previousScore = score;
      for (let i = 0; i < iterations; i++) {
          const newState = chooseNewState(tmpSudoku, fixedSudoku, listOfBlocks, sigma);

          // Trạng thái hiện tại (tmpSudoku) được cập nhật với trạng thái mới được đề xuất từ chooseNewState
          tmpSudoku = newState[0]; 
          // Chênh lệch điểm số giữa trạng thái mới và trạng thái hiện tại 
          let scoreDiff = newState[1];
          score += scoreDiff;

          if (score <= 0) {
              solutionFound = 1;
              break;
          }
      }

      sigma *= decreaseFactor; // xác suất chấp nhận các trạng thái mới có điểm số tăng lên sẽ giảm.
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

