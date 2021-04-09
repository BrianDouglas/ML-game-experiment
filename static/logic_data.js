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
        this.chartTypeSelect = document.getElementById("chartType");
        this.chartTypeSelect.addEventListener("change", this.changeChart);
        // get data for chart
        d3.json("/json_data", data => {
            this.data = data;
        })
        // define goals, need to make this not hard coded at some point
		this.goals = [{col: 4, row: 5, active: true},{col: 1, row: 8, active: true},{col: 8, row: 8, active: true}]
        // add our event listener
        this.topContext.canvas.addEventListener("mousedown", this.cellSelect);
	}

    changeChart = (event) => {
        if (event.target.value === 'time'){
            this.myChart.options.title.text = "Time to Act In This State"
            this.myChart.config.data.labels = [0.1,0.2,0.3,0.4,0.5,0.6,0.7,0.8,0.9,1.0,1.1,1.2,1.3,1.4,1.5,1.6,1.7,1.8,1.9,2.0,2.1,2.2,2.3,2.4,2.5,2.6,2.7,2.8,2.9,3.0];
            this.myChart.options.tooltips.enabled = false
        } else {
            this.myChart.options.title.text = "Actions Taken In This State"
            this.myChart.config.data.labels = ['LEFT', 'RIGHT', 'DOWN', 'UP']
            this.myChart.options.tooltips.enabled = true
        }
        //this.myChart.update();
        this.updateChart();
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
        if (this.chartTypeSelect.value === "action"){
            let left = result.actions.LEFT;
            let right = result.actions.RIGHT;
            let down = result.actions.DOWN;
            let up = result.actions.UP;
            this.myChart.data.datasets[0].data = [left, right, down, up];
        } else {
            let data_objs;
            if (result){
                data_objs = this.parseTimeList(result.time);
            } else {
                data_objs = []
            }
            this.myChart.data.datasets[0].data = data_objs;
        }
        this.myChart.update()
    }

    parseTimeList(times_list){
        let data_objs = [{x:3.0, y:0}]
        let prev;
        console.log(times_list);
        times_list.sort()
        for (let i = 0; i < times_list.length; i++){
            if (times_list[i] < 3000){
                let x_num = Math.round((times_list[i]/100))/10
                if (x_num !== prev){
                    data_objs.push({x:x_num,y:1});
                } else{
                    data_objs[data_objs.length - 1].y++;
                }
                prev = x_num
            } else {
                data_objs[0].y++
            }
        }
        console.log(data_objs);
        return data_objs
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