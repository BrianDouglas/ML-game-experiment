class PlayerMaze extends GridSystem {
/*
GridSystem class modified from public repo at https://github.com/fahadhaidari/game-code-bites/tree/master/grid-based-system-with-character
*/
	constructor(matrix, player_pos, elementID = "game", properties = {}) {
		super(matrix, player_pos, elementID, properties)
		
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

document.addEventListener('DOMContentLoaded', () => {
	let maze = new PlayerMaze(gridMatrix, {x:1,y:1});
	maze.render();
});