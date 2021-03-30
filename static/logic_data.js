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

Chart.defaults.global.defaultFontFamily = "'Courier New', Courier, monospace";
//Chart.defaults.global.defaultFontSize = 20;

class DataPage {
/*
GridSystem class modified from public repo at https://github.com/fahadhaidari/game-code-bites/tree/master/grid-based-system
*/
	constructor(matrix, playerX, playerY, elementIDs = ["game","chart"]) {
		this.matrix = matrix;
        this.gameElementID = elementIDs[0];
        this.chartElementID = elementIDs[1];
        this.cellSize = 30;
		this.padding = 2;
        this.data = {}
		this.uiContext = this.getContext(WIDTH, HEIGHT, UICOLOR);
		this.outlineContext = this.getContext(0, 0, OUTLINECOLOR);
		this.topContext = this.getContext(0, 0, BACKGROUNDCOLOR, true);
        
        this.chartContext = document.getElementById('chart').getContext('2d');
        this.myChart = new Chart(this.chartContext,{
            type: 'bar',
            data: {
                labels: ['LEFT', 'RIGHT', 'DOWN', 'UP'],
                datasets: [{
                    label: 'Action Taken',
                    data: [0, 0, 0, 0],
                    backgroundColor: BACKGROUNDCOLOR,
                    borderWidth: 1,
                    borderColor: 'white',
                    hoverBorderWidth: 3,
                    hoverBorderColor: COINCOLOR
                }]
            },
            options:{
                title: {
                    display: true,
                    text: "Actions Taken In This State",
                    fontSize: 25

                },
                legend: {
                    display: false, 
                },
                layout:{
                    padding:{
                        top: 0,
                    },
                },
                tooltips: {
                    callbacks: {
                        label: function(tooltipItem, data) {
                            //get the concerned dataset
                            var dataset = data.datasets[tooltipItem.datasetIndex];
                            //calculate the total of this data set
                            var total = dataset.data.reduce(function(previousValue, currentValue, currentIndex, array) {
                                return previousValue + currentValue;
                            });
                            //get the current items value
                            var currentValue = dataset.data[tooltipItem.index];
                            //calculate the precentage based on the total and current item, also this does a rough rounding to give a whole number
                            var percentage = Math.floor(((currentValue/total) * 100)+0.5);
                        
                            return percentage + "%";
                        }
                    },
                    displayColors: false,
                    bodyFontSize: 16,
                },
                scales: {
                    yAxes: [{
                        ticks: {
                            beginAtZero: true
                        }
                    }]
                }
                
            }
        })

        d3.json("/json_data", data => {
            this.data = data;
        })

        this.player = { x: playerX, y: playerY, color: PLAYERCOLOR, size: 20 };
        this.matrix[playerY][playerX] = 0;
		this.goals = [{col: 4, row: 5, active: true},{col: 1, row: 8, active: true},{col: 8, row: 8, active: true}]

        this.topContext.canvas.addEventListener("mousedown", this.cellSelect);
	}

    cellSelect = (event) => {
        const rect = this.topContext.canvas.getBoundingClientRect();
        let x_pos = event.clientX - rect.left;
        let y_pos = event.clientY - rect.top;
        let col = parseInt(x_pos/(this.cellSize + this.padding))  
        let row = parseInt(y_pos/(this.cellSize + this.padding))
        console.log(`(${row}, ${col})`)
        if (event.shiftKey){
            var goal_check = this.goals.find(goal => goal.col === col && goal.row === row)
            if (goal_check){
                goal_check.active = !goal_check.active;
                if (goal_check.active){
                    this.matrix[row][col] = 3
                }else{
                    this.matrix[row][col] = 0
                }
                this.render()
            }else{
                console.log("Not a valid goal square.")
            }
        }else if (this.matrix[row][col] === 3){
            var goal = this.goals.find(goal => goal.col === col && goal.row === row)
            if (goal.active){
                goal.active = !goal.active;
            }
            this.updateMatrix(this.player.y, this.player.x, 0);
            this.updateMatrix(row, col, 2);
            this.player.x = col;
            this.player.y = row;
            this.render()
        }
        else if (this.matrix[row][col] === 0){
            this.updateMatrix(this.player.y, this.player.x, 0);
            this.updateMatrix(row, col, 2);
            this.player.x = col;
            this.player.y = row;
            this.render()
        }
    }

    updateChart(){
        var result = this.data[this.getMatrixString()];
        let left = result.LEFT;
        let right = result.RIGHT;
        let down = result.DOWN;
        let up = result.UP;
        this.myChart.data.datasets[0].data = [left, right, down, up];
        this.myChart.update()
        //this.data[this.getMatrixString()]
    }

    getMatrixString(){
        let string = '[['
        for (var row in this.matrix){
            string += this.matrix[row].join(', ') + '], ['
        }
        return string.slice(0, -3) + ']'
    }

    updateMatrix(y, x, val) {
		this.matrix[y][x] = val;
	}

	getCenter(w, h) {
		//center on x on window. center y on game size
		return {
			x: WIDTH / 2 - w / 2 + "px",
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
        document.getElementById(this.gameElementID).appendChild(this.canvas);

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
                
                var isGoal = this.goals.find(goal => goal.col === col && goal.row === row)
                if (isGoal && !isGoal.active) {
                    color = 'pink';
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
		this.uiContext.fillText("Select a cell to see action data", 20, 30);
	    this.uiContext.fillText("Shift-click to toggle goals", 48, 400);
		
        this.updateChart()
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
    let dataPage = new DataPage(gridMatrix, 1, 1);
    dataPage.render();
});