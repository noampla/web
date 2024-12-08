const boardSize = 8; // 8x8 matrix (includes borders)
const playableSize = 6; // 6x6 playable area
const pcBoard = Array(boardSize * boardSize).fill(''); // Initialize empty board

let playerBoard = Array(boardSize * boardSize).fill(''); // Player's board
let turnCount = 0; // Track the number of turns

const laserResults = {}; // Store results for each entry point


// Object selection
let selectedObject = null; // The object the player wants to place

function selectObject(object) {
    selectedObject = object; // Set the selected object
}

function placeObject(index) {
    if (!selectedObject) return; // No object selected, do nothing

    const x = index % boardSize;
    const y = Math.floor(index / boardSize);

    // Prevent placement on existing blockers
    if (pcBoard[index] === 'B') {
        console.log(`Cannot place object at position ${index}, it's a blocker.`);
        return;
    }

    if (x > 0 && x < boardSize - 1 && y > 0 && y < boardSize - 1) {
        // Update player's board
        playerBoard[index] = selectedObject === ' ' ? '' : selectedObject;

        const cell = document.querySelector(`.cell[data-position="${index}"]`);
        if (selectedObject === ' ') {
            cell.textContent = ''; // Clear the cell if "remove" is selected
            cell.style.backgroundColor = ''; // Reset background
        } else if (['red', 'blue', 'green'].includes(selectedObject)) {
            cell.textContent = ''; // No text for colors
            cell.style.backgroundColor = selectedObject; // Inline style for colors
        } else if (selectedObject === 'B') {
            cell.textContent = ''; // No text for blockers
            cell.style.backgroundColor = 'black'; // Inline style for blockers
        } else {
            cell.textContent = selectedObject; // Add the text for other objects
            cell.style.backgroundColor = ''; // Reset color for text-based objects
        }
    }
}



function checkSolution() {
    turnCount++; // Increment the turn counter
    updateTurnCount(); // Update the turn display in the output area

    let correct = true; // Assume the solution is correct initially

    console.log('--- Checking Solution ---');
    console.log('pcBoard:', pcBoard);
    console.log('playerBoard:', playerBoard);

    for (let i = 0; i < pcBoard.length; i++) {
        // Check if the player's placement matches the pcBoard
        if (pcBoard[i] !== playerBoard[i]) {
            console.log(`Mismatch at index ${i}: Expected '${pcBoard[i]}', Found '${playerBoard[i]}'`);
            correct = false;
        }
    }

    const outputDiv = document.getElementById('output');
    if (correct) {
        outputDiv.textContent = `Congratulations! You solved the board in ${turnCount} turns.`;
        initializeBoard(); // Restart the game
    } else {
        outputDiv.textContent = `Incorrect! Keep trying. Turns: ${turnCount}`;
    }
}

function updateTurnCount() {
    const turnCountDisplay = document.getElementById('turnCount');
    if (turnCountDisplay) {
        turnCountDisplay.textContent = `Turns: ${turnCount}`;
    }
}


function initializeControls() {
    document.getElementById('selectRed').onclick = () => selectObject('red');
    document.getElementById('selectBlue').onclick = () => selectObject('blue');
    document.getElementById('selectGreen').onclick = () => selectObject('green');
    document.getElementById('selectBlocker').onclick = () => selectObject('B');
    document.getElementById('removeObject').onclick = () => selectObject(' ');
    document.getElementById('checkButton').onclick = checkSolution;
    document.getElementById('surrenderButton').onclick = surrender; // Add surrender button functionality

    // Add click event for each playable cell
    document.querySelectorAll('.cell').forEach((cell, index) => {
        const x = index % boardSize; // Column index
        const y = Math.floor(index / boardSize);

        // Only assign placeObject to playable cells (inner 6x6 grid)
        if (x > 0 && x < boardSize - 1 && y > 0 && y < boardSize - 1) {
            cell.onclick = () => placeObject(index);
        }
    });
}

function initializeBoard() {
    const boardContainer = document.getElementById('board');
    boardContainer.innerHTML = ''; // Clear the board container

    randomizeObjects(); // Generate pcBoard and objects randomly

    // Create the 8x8 board (including labels)
    for (let i = 0; i < boardSize * boardSize; i++) {
        const cell = document.createElement('div');
        cell.classList.add('cell');
        cell.setAttribute('data-position', i); // Debugging aid: position tracking

        const x = i % boardSize; // Column index (0-7)
        const y = Math.floor(i / boardSize); // Row index (0-7)

        // Top row labels (A-F)
        if (y === 0 && x > 0 && x < boardSize - 1) {
            cell.textContent = String.fromCharCode(64 + x); // Convert to A-F
            cell.style.backgroundColor = '#f0f0f0';
            cell.style.cursor = 'pointer';
            cell.onclick = () => queryLaser(i, 'down'); // Laser enters from top
        }
        // Bottom row labels (G-L)
        else if (y === boardSize - 1 && x > 0 && x < boardSize - 1) {
            cell.textContent = String.fromCharCode(71 + x - 1); // Convert to G-L
            cell.style.backgroundColor = '#f0f0f0';
            cell.style.cursor = 'pointer';
            cell.onclick = () => queryLaser(i, 'up'); // Laser enters from bottom
        }
        // Left column labels (1-6)
        else if (x === 0 && y > 0 && y < boardSize - 1) {
            cell.textContent = y; // Numbers 1-6
            cell.style.backgroundColor = '#f0f0f0';
            cell.style.cursor = 'pointer';
            cell.onclick = () => queryLaser(i, 'right'); // Laser enters from left
        }
        // Right column labels (7-12)
        else if (x === boardSize - 1 && y > 0 && y < boardSize - 1) {
            cell.textContent = 6 + y; // Numbers 7-12
            cell.style.backgroundColor = '#f0f0f0';
            cell.style.cursor = 'pointer';
            cell.onclick = () => queryLaser(i, 'left'); // Laser enters from right
        }
        // Playable 6x6 grid (center)
        else if (x > 0 && x < boardSize - 1 && y > 0 && y < boardSize - 1) {
            const playableIndex = (y - 1) * playableSize + (x - 1);

            // Show objects placed by the player
            if (playerBoard[i]) {
                if (['red', 'blue', 'green'].includes(playerBoard[i])) {
                    cell.style.backgroundColor = playerBoard[i]; // Display colors
                } else if (playerBoard[i] === 'B') {
                    cell.style.backgroundColor = 'black'; // Display blockers as black
                }
            }

            cell.onclick = () => placeObject(i); // Allow players to place objects
        } else {
            // Empty border cells
            cell.style.backgroundColor = '#eaeaea';
        }

        boardContainer.appendChild(cell); // Add cell to the board
    }
}




// Randomize and reveal functionality remains the same.



function surrender() {
    console.log('--- Revealing Solution ---');
    console.log('pcBoard:', pcBoard);

    const cells = document.querySelectorAll('.cell');
    cells.forEach((cell, index) => {
        const x = index % boardSize;
        const y = Math.floor(index / boardSize);

        if (x > 0 && x < boardSize - 1 && y > 0 && y < boardSize - 1) {
            // Reveal the pcBoard contents
            if (pcBoard[index]) {
                if (['red', 'blue', 'green'].includes(pcBoard[index])) {
                    cell.setAttribute('style', `background-color: ${pcBoard[index]}`); // Reveal colors
                } else if (pcBoard[index] === 'B') {
                    cell.setAttribute('style', 'background-color: black'); // Reveal blocker
                }
            }
        }
    });

    const outputDiv = document.getElementById('output');
    outputDiv.textContent = 'You surrendered! Here is the solution.';
}









function randomizeObjects() {
    const playablePositions = [];

    // Identify all valid positions within the playable 6x6 area
    for (let y = 1; y <= playableSize; y++) {
        for (let x = 1; x <= playableSize; x++) {
            const position = y * boardSize + x; // Offset by 1 for labels
            playablePositions.push(position);
        }
    }

    function getRandomPosition() {
        const index = Math.floor(Math.random() * playablePositions.length);
        return playablePositions.splice(index, 1)[0]; // Remove position to prevent overlap
    }

    // Reset pcBoard
    pcBoard.fill('');

    // Place the blocker
    const blockerPosition = getRandomPosition();
    pcBoard[blockerPosition] = 'B';
    console.log(`Blocker placed at index ${blockerPosition}`);

    // Place the colors
    const redPosition = getRandomPosition();
    const bluePosition = getRandomPosition();
    const greenPosition = getRandomPosition();
    pcBoard[redPosition] = 'red';
    pcBoard[bluePosition] = 'blue';
    pcBoard[greenPosition] = 'green';
    console.log(`Colors placed: Red at ${redPosition}, Blue at ${bluePosition}, Green at ${greenPosition}`);
}






function getLabelCellByPosition(position) {
    return document.querySelector(`.cell[data-position="${position}"]`);
}




function queryLaser(position, direction) {
    console.log(`queryLaser called: position = ${position}, direction = ${direction}`);
    turnCount++; // Increment the turn counter
    updateTurnCount(); // Update the turn display in the output area

    const result = traceLaser(position, direction);
    console.log('Laser result:', result); // Debugging log

    const outputDiv = document.getElementById('output');

    // Reset animations for all cells
    document.querySelectorAll('.cell').forEach(cell => {
        cell.classList.remove('entry-flash', 'exit-flash', 'entry-blocked');
    });

    // Handle the entry point animation
    const startCell = getLabelCellByPosition(position);
    if (startCell) {
        startCell.offsetWidth; // Trigger reflow for animation
        if (result.blocked) {
            startCell.classList.add('entry-blocked'); // Black animation for blocked
        } else {
            startCell.classList.add('entry-flash'); // Green animation for normal entry
        }
        
        
        // Clear existing results below the entry point
        const existingResult = startCell.querySelector('.entry-result');
        if (existingResult) existingResult.remove();

        // Create a container for the result below the entry point
        const resultContainer = document.createElement('div');
        resultContainer.classList.add('entry-result');

        // Add the exit point text or only the black circle if blocked
        if (result.blocked) {
            const blockerCircle = createColorCircle('black'); // Black circle for blocker
            resultContainer.appendChild(blockerCircle);
        } else {
            // Add the exit point text
            const entryExitText = document.createElement('span');
            entryExitText.textContent = `→ ${result.exit}`; // Exit point
            entryExitText.classList.add('entry-exit-text');
            resultContainer.appendChild(entryExitText);

            // Add color circles if the laser hits colors
            if (result.hitColors.length > 0) {
                result.hitColors.forEach(color => {
                    const colorCircle = createColorCircle(color);
                    resultContainer.appendChild(colorCircle);
                });
            }
        }

        // Attach the result container to the entry point
        startCell.appendChild(resultContainer);
    }

    // Handle the exit point animation
    if (!result.blocked && result.exit) {
        const exitCell = getLabelCell(result.exit);
        if (exitCell) {
            console.log('Adding exit animation to:', result.exit); // Debugging log

            // Force reflow to ensure reanimation
            void exitCell.offsetWidth; // Trigger reflow
            exitCell.classList.add('exit-flash'); // Yellow animation for exit
        }
    }

    // Display the output message
    if (result.blocked) {
        outputDiv.textContent = `The laser was blocked. Turns: ${turnCount}`;
    } else {
        outputDiv.textContent = `The laser exits at ${result.exit}. Colors hit: ${result.hitColors.join(', ') || 'None'}. Turns: ${turnCount}`;
    }
}









// Helper function to create a color circle
function createColorCircle(color) {
    const circle = document.createElement('div');
    circle.classList.add('color-circle');
    circle.style.backgroundColor = color;
    return circle;
}

function animateButton(button) {
    button.classList.add('button-color-flash'); // Add animation class
    setTimeout(() => button.classList.remove('button-color-flash'), 300); // Remove it after animation completes
}

// Add event listeners for the buttons below the title
document.querySelectorAll('.top-button').forEach(button => {
    button.addEventListener('click', () => animateButton(button));
});



// Helper function to create a color circle
function createColorCircle(color) {
    const circle = document.createElement('div');
    circle.classList.add('color-circle');
    circle.style.backgroundColor = color;
    return circle;
}


function getLabelCell(label) {
    return Array.from(document.querySelectorAll('.cell')).find(cell => cell.textContent.trim() === String(label));
}


function updateLaserResultsUI() {
    // Clear existing results
    document.querySelectorAll('.laser-result').forEach(el => el.remove());

    // Render results for each entry point
    for (const [position, result] of Object.entries(laserResults)) {
        const resultElement = document.createElement('div');
        resultElement.textContent = result;
        resultElement.classList.add('laser-result');

        // Attach the result to the corresponding label cell
        const labelCell = getLabelCellByPosition(position);
        if (labelCell) {
            labelCell.appendChild(resultElement); // Add the result near the label
        }
    }
}


// Helper function to find the correct cell for a given label position
function getLabelCellByPosition(position) {
    return document.querySelector(`.cell[data-position="${position}"]`);
}

// Helper function to find the label cell by its content (e.g., "12" or "A")
function getLabelCell(label) {
    return Array.from(document.querySelectorAll('.cell')).find(cell => cell.textContent === String(label));
}


// Helper function to find the correct cell for a given label position
function getLabelCellByPosition(position) {
    return document.querySelector(`.cell[data-position="${position}"]`);
}

// Helper function to find the label cell by its content (e.g., "12" or "A")
function getLabelCell(label) {
    return Array.from(document.querySelectorAll('.cell')).find(cell => cell.textContent === String(label));
}


// Helper function to find the label cell by its content
function getLabelCell(label) {
    return Array.from(document.querySelectorAll('.cell')).find(cell => cell.textContent === String(label));
}


// Helper function to find the label cell by its content
function getLabelCell(label) {
    return Array.from(document.querySelectorAll('.cell')).find(cell => cell.textContent === String(label));
}


// Helper function to find the label cell by its content
function getLabelCell(label) {
    return Array.from(document.querySelectorAll('.cell')).find(cell => cell.textContent === String(label));
}


// Helper function to find the label cell by its content
function getLabelCell(label) {
    return Array.from(document.querySelectorAll('.cell')).find(cell => cell.textContent === String(label));
}


// Helper function to find the label cell by its content
function getLabelCell(label) {
    return Array.from(document.querySelectorAll('.cell')).find(cell => cell.textContent === String(label));
}

function traceLaser(position, direction) {
    const hitColors = new Set(); // Track colors hit
    let blocked = false;

    console.log(`Starting traceLaser from position ${position}, direction: ${direction}`);

    while (true) {
        const x = position % boardSize; // Column index (0-7)
        const y = Math.floor(position / boardSize); // Row index (0-7)

        // Check if the laser exits the board
        if (
            (y === 0 && direction === "up") || // Top row
            (y === boardSize - 1 && direction === "down") || // Bottom row
            (x === 0 && direction === "left") || // Left column
            (x === boardSize - 1 && direction === "right") // Right column
        ) {
            let exit = null;

            if (y === 0 && direction === "up") exit = String.fromCharCode(64 + x); // Top row (A-F)
            if (y === boardSize - 1 && direction === "down") exit = String.fromCharCode(71 + x - 1); // Bottom row (G-L)
            if (x === 0 && direction === "left") exit = y; // Left column (1-6)
            if (x === boardSize - 1 && direction === "right") exit = 6 + y; // Right column (7-12)
            console.log('EXIT POINT')
            
            console.log(`Laser exits at ${exit}`);
            return { exit, hitColors: Array.from(hitColors), blocked: false };
        }

        const cell = pcBoard[position];

        // Check if the laser hits a blocker
        if (cell === "B") {
            console.log(`Laser is blocked at position ${position}`);
            blocked = true;
            return { exit: null, hitColors: Array.from(hitColors), blocked: true };
        }

        // Check if the laser hits a color
        if (pcBoard[position]) {
            console.log(`Laser hits color: ${pcBoard[position]} at position ${position}`);
            hitColors.add(pcBoard[position]);
        }

        // Move the laser in the current direction
        console.log(`Laser moving ${direction} from position ${position}`);
        if (direction === "right") position++;
        else if (direction === "left") position--;
        else if (direction === "down") position += boardSize;
        else if (direction === "up") position -= boardSize;

        // Prevent infinite loops or invalid positions
        if (position < 0 || position >= boardSize * boardSize) {
            console.error(`Unexpected out-of-bounds error at position ${position}`);
            return { exit: null, hitColors: Array.from(hitColors), blocked: false };
        }
    }
}



document.addEventListener('DOMContentLoaded', () => {
    initializeBoard();   // Render the board
    initializeControls(); // Initialize controls for object placement and buttons
});


