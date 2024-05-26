"use strict";

//fetch sudoku array
function fetchSudokuArray(sudokuGridElement) {
  const nine_by_nine_arr = [];
  for (let i = 0; i < sudokuGridElement.rows.length; i++) {
    let single_arr = [];
    for (let j = 0; j < sudokuGridElement.rows[i].cells.length; j++) {
      let grid_num =
        sudokuGridElement.rows[i].cells[j].querySelector("input").value;
      grid_num = grid_num == null || grid_num === "" ? 0 : +grid_num;
      single_arr.push(grid_num);
    }
    nine_by_nine_arr.push(single_arr);
  }

  return nine_by_nine_arr;
}

//uploading a new sudoku array
// Generate the spiral coordinates for a 9x9 grid
function generateSpiralCoordinates(rows, cols) {
  let top = 0,
    bottom = rows - 1,
    left = 0,
    right = cols - 1;
  const coordinates = [];

  while (top <= bottom && left <= right) {
    // Move right across the top row
    for (let j = left; j <= right; j++) {
      coordinates.push([top, j]);
    }
    top++;

    // Move down the right column
    for (let i = top; i <= bottom; i++) {
      coordinates.push([i, right]);
    }
    right--;

    // Move left across the bottom row
    if (top <= bottom) {
      for (let j = right; j >= left; j--) {
        coordinates.push([bottom, j]);
      }
      bottom--;
    }

    // Move up the left column
    if (left <= right) {
      for (let i = bottom; i >= top; i--) {
        coordinates.push([i, left]);
      }
      left++;
    }
  }
  return coordinates;
}

function flipElTextAnim(flipperElem, newVal, innerElem, delay = 0) {
  innerElem.value = newVal;
  setTimeout(() => {
    flipperElem.classList.toggle("flipped");
  }, delay);
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function uploadSudokuArray(sudokuGridElement, grid, reveal_coordinates) {
  const base_delay = 250;
  let delay_timer = 0;
  for (let k = 0; k < reveal_coordinates.length; k++) {
    let i = reveal_coordinates[k][0];
    let j = reveal_coordinates[k][1];
    if (
      sudokuGridElement.rows[i].cells[j].querySelector("input").value !=
      grid[i][j]
    ) {
      delay_timer = base_delay * Math.exp(-0.1 * k) + 10;
      flipElTextAnim(
        sudokuGridElement.rows[i].cells[j].querySelector(".flip-container"),
        grid[i][j],
        sudokuGridElement.rows[i].cells[j].querySelector(".back input"),
        0
      );
      
      if (doc)
      
    }
    else{
      delay_timer = 0;
      sudokuGridElement.rows[i].cells[j].querySelector(".back input").value = grid[i][j];
      sudokuGridElement.rows[i].cells[j].querySelector(".flip-container").classList.toggle("no-anim-flipped");
    }

    await sleep(delay_timer);
  }
}

//sudoku solving algo ------------------------------------------
function num_in_row(grid, row, num) {
  for (let col = 0; col < grid[row].length; col++) {
    if (grid[row][col] === num) {
      return true;
    }
  }
  return false;
}

function num_in_col(grid, col, num) {
  for (let row = 0; row < grid.length; row++) {
    if (grid[row][col] === num) {
      return true;
    }
  }
  return false;
}

function num_in_box(grid, startRow, startCol, num) {
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 3; col++) {
      if (grid[row + startRow][col + startCol] === num) {
        return true;
      }
    }
  }
  return false;
}

// checking if grid is valid
function is_valid_sudoku(grid) {
  for (let row = 0; row < grid.length; row++) {
    for (let col = 0; col < grid[row].length; col++) {
      let cur_num = grid[row][col];
      if (cur_num != 0) {
        grid[row][col] = 0;
        if (
          num_in_row(grid, row, cur_num) ||
          num_in_col(grid, col, cur_num) ||
          num_in_box(grid, row - (row % 3), col - (col % 3), cur_num)
        ) {
          grid[row][col] = cur_num;
          return false;
        }
        grid[row][col] = cur_num;
      }
    }
  }
  return true;
}

//checks if you can place the number there
function is_safe_spot(grid, row, col, num) {
  // check row is ok
  if (num_in_row(grid, row, num)) {
    return false;
  }

  // check column is ok
  if (num_in_col(grid, col, num)) {
    return false;
  }

  // check box is ok
  if (num_in_box(grid, row - (row % 3), col - (col % 3), num)) {
    return false;
  }

  return true;
}

//finds the next empty spot
function exists_empty_spot(grid, coord) {
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (grid[row][col] == 0) {
        coord[0] = row;
        coord[1] = col;
        return true;
      }
    }
  }
  return false;
}

function solveSudoku(unsolved_grid) {
  let coord = [0, 0];
  if (!exists_empty_spot(unsolved_grid, coord)) {
    return true;
  }

  let row = coord[0];
  let col = coord[1];

  for (let num = 1; num <= 9; num++) {
    if (is_safe_spot(unsolved_grid, row, col, num)) {
      unsolved_grid[row][col] = num;

      if (solveSudoku(unsolved_grid)) {
        return true;
      }

      unsolved_grid[row][col] = 0;
    }
  }

  return false;
}


// flips submit btn

function flipbtn(){
  const flipperEl = document.querySelector(".flip-container-btn");
  flipperEl.classList.toggle("flipped");
}
//complete function for displaying sudoku results
function displaySudokuResults() {
  const sudokuGrid = fetchSudokuArray(document.getElementById("sudoku-table"));

  if (is_valid_sudoku(sudokuGrid)) {
    solveSudoku(sudokuGrid);
    uploadSudokuArray(
      document.getElementById("sudoku-table"),
      sudokuGrid,
      generateSpiralCoordinates(9, 9).reverse()
    );
  } else {
    console.log("unvalid grid!");
  }
  
  flipbtn();
}



//comlete function for clearing the sudoku board
function clearSudokuResults(){
  const gridEl = document.getElementById("sudoku-table");
  for (let i = 0; i < 9; i++){
    for (let j = 0; j < 9; j++){
      const flipEl = gridEl.rows[i].cells[j].querySelector(".flip-container");
      if (flipEl.classList.contains("no-anim-flipped")){
        flipEl.querySelector(".flipper .front input").value = '';
        flipEl.classList.toggle("no-anim-flipped");
      }
      else{
        
        flipEl.classList.toggle("flipped");
        flipEl.querySelector(".flipper .front input").value = '';
      }
  }

  flipbtn()
}
}

const solve_btn = document.getElementById("solve-btn");

solve_btn.addEventListener("click", displaySudokuResults);

const clear_btn = document.getElementById("clear-btn");

clear_btn.addEventListener("click", clearSudokuResults);