Chart.defaults.global.defaultFontFamily = "'Courier New', Courier, monospace";

class DataPage extends GridSystem{
/*
GridSystem class modified from public repo at https://github.com/fahadhaidari/game-code-bites/tree/master/grid-based-system
*/
	constructor(matrix, player_pos, elementIDs = ["game","chart"], properties = {}) {
		super(matrix, player_pos, elementIDs[0], properties, false)
        // set up chart
        this.chartContext = document.getElementById(elementIDs[1]).getContext('2d');
        this.myChart = new Chart(this.chartContext,{
            type: 'bar',
            data: {
                labels: ['LEFT', 'RIGHT', 'DOWN', 'UP'],
                datasets: [{
                    label: 'Action Taken',
                    data: [0, 0, 0, 0],
                    backgroundColor: this.BACKGROUNDCOLOR,
                    borderWidth: 1,
                    borderColor: 'white',
                    hoverBorderWidth: 3,
                    hoverBorderColor: this.COINCOLOR
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
        // get data for chart
        d3.json("/json_data", data => {
            this.data = data;
        })
        // define goals, need to make this not hard coded at some point
		this.goals = [{col: 4, row: 5, active: true},{col: 1, row: 8, active: true},{col: 8, row: 8, active: true}]
        // add our event listener
        this.topContext.canvas.addEventListener("mousedown", this.cellSelect);
	}

    cellSelect = (event) => {
        const rect = this.topContext.canvas.getBoundingClientRect();
        let x_pos = event.clientX - rect.left;
        let y_pos = event.clientY - rect.top;
        let col = parseInt(x_pos/(this.cellSize + this.padding))  
        let row = parseInt(y_pos/(this.cellSize + this.padding))
        //console.log(`(${row}, ${col})`)
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

    chooseColor(row, col, cellVal){
        // default to background color
        let color = this.BACKGROUNDCOLOR;
		// reasons to change
        if (cellVal === 1) {
            color = this.WALLCOLOR;
        }
        //check for inactive goal
        var isGoal = this.goals.find(goal => goal.col === col && goal.row === row)
        if (isGoal && !isGoal.active) {
            color = 'pink';
        }
        return color
    }

    renderUI(){
        this.uiContext.clearRect(0,0, this.WIDTH, this.HEIGHT)
		this.uiContext.font = "20px Courier";
		this.uiContext.fillStyle = "white";
		this.uiContext.fillText("Select a cell to see action data", 20, 30);
	    this.uiContext.fillText("Shift-click to toggle goals", 48, 400);
		
        if (this.data){
            this.updateChart()
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
    let dataPage = new DataPage(gridMatrix, {x:1,y:1});
    dataPage.render();
});