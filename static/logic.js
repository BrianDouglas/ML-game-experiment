const BACKGROUNDCOLOR = "#440154";
const WALLCOLOR = "#30678D";
const UICOLOR = "#000";
const OUTLINECOLOR = "#444"

const PLAYERCOLOR = "#35B778";
const EXITCOLOR = "purple";
const COINCOLOR = "#FDE724";

const WIDTH = 420;
const HEIGHT = 420;

const GRIDSIZE = 10;

class GridSystem {
/*
GridSystem class modified from public repo at https://github.com/fahadhaidari/game-code-bites/tree/master/grid-based-system
*/
	constructor(matrix, playerX, playerY, elementID = "game") {
		this.matrix = matrix;
        this.elementID = elementID;
        this.game_id = Date.now()
		this.uiContext = this.getContext(WIDTH, HEIGHT, UICOLOR);
		this.outlineContext = this.getContext(0, 0, OUTLINECOLOR);
		this.topContext = this.getContext(0, 0, BACKGROUNDCOLOR, true);
		this.cellSize = 30;
		this.padding = 2;

        this.player = { x: playerX, y: playerY, color: PLAYERCOLOR, size: 20 };
        this.matrix[playerY][playerX] = 2;
		this.num_goals = 3

		this.moveHistory = [];
        document.addEventListener("keydown", this.movePlayer);
	}

	getMoveHistory(){
		console.log(this.moveHistory)
	}

	sendMoves(){
		let moveHistory_ids = {id: this.game_id, gameplay: this.moveHistory}
		let states_actions = JSON.stringify(moveHistory_ids)
		fetch('/game_data', {
			headers: { 'Content-Type': 'application/json'},
			method: 'POST',
			body: states_actions
		})
		this.num_goals -= 1;
	}

    isValidMove(x, y) {
        let newX = this.player.x + x;
        let newY = this.player.y + y;
		let Xbound = true ? newX >= 0 && newX < this.matrix[0].length : false;
        let Ybound = true ? newY >= 0 && newY < this.matrix.length : false;
		if (Xbound && Ybound){
			if (this.matrix[newY][newX] == 3){
				this.num_goals -= 1;
				return true
			}
            if (this.matrix[newY][newX] != 1){
                return true;
            }
        }
		return false;
	}

    updateMatrix(y, x, val) {
		this.matrix[y][x] = val;
	}

    movePlayer = ( event ) => {
		var key = event.code;
		if (this.num_goals > 0){
			let current_state = JSON.parse(JSON.stringify(this.matrix));
			if (key === "KeyA") {
				if (this.isValidMove(-1, 0)) {
					this.moveHistory.push({state: current_state, action: 'LEFT'});
					this.updateMatrix(this.player.y, this.player.x, 0);
					this.updateMatrix(this.player.y, this.player.x - 1, 2);
					this.player.x --;
					this.render();
				}
			} else if (key === "KeyD") {
				if (this.isValidMove(1, 0)) {
					this.moveHistory.push({state: current_state, action: 'RIGHT'})
					this.updateMatrix(this.player.y, this.player.x, 0);
					this.updateMatrix(this.player.y, this.player.x + 1, 2);
					this.player.x ++;
					this.render();
				}
			} else if (key === "KeyW") {
				if (this.isValidMove(0, -1)) {
					this.moveHistory.push({state: current_state, action: 'UP'})
					this.updateMatrix(this.player.y, this.player.x, 0);
					this.updateMatrix(this.player.y - 1, this.player.x, 2);
					this.player.y --;
					this.render();
				}
			} else if (key === "KeyS") {
				if (this.isValidMove(0, 1)) {
					this.moveHistory.push({state: current_state, action: 'DOWN'})
					this.updateMatrix(this.player.y, this.player.x, 0);
					this.updateMatrix(this.player.y + 1, this.player.x, 2);
					this.player.y ++;
					this.render();
				}
			}
		}
		if (this.num_goals === 0){
			this.sendMoves()
		}	 
		if (key === "KeyR") {
			this.reset()
		}
	}

	getCenter(w, h) {
		//center on x on window. center y on game size
		return {
			x: window.innerWidth / 2 - w / 2 + "px",
			y: HEIGHT / 2 - h / 2 + "px"
		};
	}

	getContext(w, h, color, isTransparent = false) {
		this.canvas = document.createElement("canvas");
		this.context = this.canvas.getContext("2d");
		this.width = this.canvas.width = w;
		this.height = this.canvas.height = h;
		this.canvas.style.position = "absolute";
		this.canvas.style.background = color;
		if (isTransparent) {
			this.canvas.style.backgroundColor = "transparent";
		}
		const center = this.getCenter(w, h);
		this.canvas.style.marginLeft = center.x;
		this.canvas.style.marginTop = center.y;
        document.getElementById(this.elementID).appendChild(this.canvas);

		return this.context;
	}

    offset(coord, gameObject = false, objectSize = 0){
        if (!gameObject){
            return coord * (this.cellSize + this.padding);
        }
        return coord * (this.cellSize + this.padding) + (this.cellSize - objectSize)/2
    }

	render() {
		const w = (this.cellSize + this.padding) * this.matrix[0].length - (this.padding);
		const h = (this.cellSize + this.padding) * this.matrix.length - (this.padding);

		this.outlineContext.canvas.width = w;
		this.outlineContext.canvas.height = h;

        this.topContext.canvas.width = w;
		this.topContext.canvas.height = h;

		const center = this.getCenter(w, h);
		this.outlineContext.canvas.style.marginLeft = center.x;
		this.outlineContext.canvas.style.marginTop = center.y;

		this.topContext.canvas.style.marginLeft = center.x;
		this.topContext.canvas.style.marginTop = center.y;

		for (let row = 0; row < this.matrix.length; row ++) {
			for (let col = 0; col < this.matrix[row].length; col ++) {
				const cellVal = this.matrix[row][col];
                let color = BACKGROUNDCOLOR;
				
                if (cellVal === 1) {
                    color = WALLCOLOR;
				}
                
                this.outlineContext.fillStyle = color;
                this.outlineContext.fillRect(this.offset(col),
                    this.offset(row),
                    this.cellSize, this.cellSize);

                if (cellVal === 2) {
                    this.topContext.fillStyle = this.player.color;
				    this.topContext.fillRect(this.offset(col, true, this.player.size),
                        this.offset(row, true, this.player.size),
				        this.player.size, this.player.size);
				}
                if (cellVal === 3) {
                    this.topContext.beginPath();
                    this.topContext.arc(this.offset(col, true, 0), 
                        this.offset(row, true, 0),
                        5, 0, 2 * Math.PI);
                    this.topContext.fillStyle = COINCOLOR;
                    this.topContext.fill();
                }

			}
		}

		this.uiContext.clearRect(0,0, WIDTH, HEIGHT)
		this.uiContext.font = "20px Courier";
		this.uiContext.fillStyle = "white";
		this.uiContext.fillText("2EZ Game", 20, 30);
		this.uiContext.fillText(`Goals Remaining: ${this.num_goals}`, 200, 30);
		if (this.num_goals == 0){
			this.uiContext.font = "24px Courier";
			this.uiContext.fillStyle = "gold";
			this.uiContext.fillText("YOU WIN! Press 'r' to reset", 20, 400);
		}
	}

    reset(){
        document.getElementById(this.elementID).innerHTML = "";
		this.matrix =  [[1,1,1,1,1,1,1,1,1,1],
						[1,0,0,0,0,0,0,0,0,1],
						[1,1,1,0,1,1,1,0,1,1],
						[1,0,0,0,0,1,0,0,0,1],
						[1,0,1,1,1,1,0,1,0,1],
						[1,0,1,1,3,1,0,1,0,1],
						[1,0,0,0,0,0,0,1,0,1],
						[1,1,1,0,1,0,1,1,0,1],
						[1,3,0,0,1,0,0,0,3,1],
						[1,1,1,1,1,1,1,1,1,1]];

		this.game_id = Date.now();
		this.uiContext = this.getContext(WIDTH, HEIGHT, UICOLOR);
		this.outlineContext = this.getContext(0, 0, OUTLINECOLOR);
		this.topContext = this.getContext(0, 0, BACKGROUNDCOLOR, true);
		this.player = { x: 1, y: 1, color: PLAYERCOLOR, size: 20 };
        this.matrix[this.player.y][this.player.x] = 2;

		this.num_goals = 3
		this.moveHistory = [];
		this.render();
    }
}

const gridMatrix = [[1,1,1,1,1,1,1,1,1,1],
					[1,0,0,0,0,0,0,0,0,1],
					[1,1,1,0,1,1,1,0,1,1],
					[1,0,0,0,0,1,0,0,0,1],
					[1,0,1,1,1,1,0,1,0,1],
					[1,0,1,1,3,1,0,1,0,1],
					[1,0,0,0,0,0,0,1,0,1],
					[1,1,1,0,1,0,1,1,0,1],
					[1,3,0,0,1,0,0,0,3,1],
					[1,1,1,1,1,1,1,1,1,1]];

/*for (var i = 0; i < GRIDSIZE; i++){
    gridMatrix.push([]);
    for (var j = 0; j < GRIDSIZE; j++){
        gridMatrix[i].push(0);
    }
}*/

document.addEventListener('DOMContentLoaded', () => {
    let gridSystem = new GridSystem(gridMatrix, 1, 1);
    gridSystem.render();
});