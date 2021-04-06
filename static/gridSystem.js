const props = {
    BACKGROUNDCOLOR : "#440154",
    WALLCOLOR : "red",
    UICOLOR : "#000",
    OUTLINECOLOR : "#444",
    PLAYERCOLOR : "#35B778",
    EXITCOLOR : "purple",
    COINCOLOR : "#FDE724",
    WIDTH : 420,
    HEIGHT : 420,
    GRIDSIZE : 10
}

class GridSystem {
    /*
    GridSystem class modified from public repo at https://github.com/fahadhaidari/game-code-bites/tree/master/grid-based-system-with-character
    */
    constructor(matrix, player_pos = {x:1,y:1}, elementID = "game", properties = {}, centerOnWindow = true) {
        this.matrix = matrix;
        this.elementID = elementID;
        this.defineProps(properties);
        this.centerOnWindow = centerOnWindow;
        
        this.game_id = Date.now();
        this.uiContext = this.getContext(this.WIDTH, this.HEIGHT, this.UICOLOR);
        this.outlineContext = this.getContext(0, 0, this.OUTLINECOLOR);
        this.topContext = this.getContext(0, 0, this.BACKGROUNDCOLOR, true);
        this.cellSize = 30;
        this.padding = 2;

        this.player = { x: player_pos.x, y: player_pos.y, color: this.PLAYERCOLOR, size: this.cellSize - 10 };
        this.matrix[player_pos.y][player_pos.x] = 2;
        this.num_goals = 3
    }

    defineProps(propertyObj){
        this.BACKGROUNDCOLOR = "BACKGROUNDCOLOR" in propertyObj ? propertyObj.BACKGROUNDCOLOR : "#440154";
        this.WALLCOLOR = "WALLCOLOR" in propertyObj ? propertyObj.WALLCOLOR : "#30678D";
        this.UICOLOR = "UICOLOR" in propertyObj ? propertyObj.UICOLOR : "#000";
        this.OUTLINECOLOR = "OUTLINECOLOR" in propertyObj ? propertyObj.OUTLINECOLOR : "#444";
        this.PLAYERCOLOR = "PLAYERCOLOR" in propertyObj ? propertyObj.PLAYERCOLOR : "#35B778";
        this.EXITCOLOR = "EXITCOLOR" in propertyObj ? propertyObj.EXITCOLOR : "purple";
        this.COINCOLOR = "COINCOLOR" in propertyObj ? propertyObj.COINCOLOR : "#FDE724";
        this.WIDTH = "WIDTH" in propertyObj ? propertyObj.WIDTH : 420;
        this.HEIGHT = "HEIGHT" in propertyObj ? propertyObj.HEIGHT : 420;
        this.GRIDSIZE = "GRIDSIZE" in propertyObj ? propertyObj.GRIDSIZE : 10;
    }

    getCenter(w, h) {
        let xVal = this.centerOnWindow ? window.innerWidth : this.WIDTH;
        
        return {
            x: xVal / 2 - w / 2 + "px",
            y: this.HEIGHT / 2 - h / 2 + "px"
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

    chooseColor(row, col, cellVal){
        // default to background color
        let color = this.BACKGROUNDCOLOR;
        // reasons to change
        if (cellVal === 1) {
            color = this.WALLCOLOR;
        }

        return color;
    }

    renderUI(){
        // 
        this.uiContext.clearRect(0,0, this.WIDTH, this.HEIGHT)
        this.uiContext.font = "20px Courier";
        this.uiContext.fillStyle = "white";
        this.uiContext.fillText("2EZ Game", 20, 30);
        this.uiContext.fillText(`Goals Remaining: ${this.num_goals}`, 200, 30);
        if (this.num_goals == 0){
            this.uiContext.font = "24px Courier";
            this.uiContext.fillStyle = this.COINCOLOR;
            this.uiContext.fillText("YOU WIN! Press 'r' to reset", 20, 400);
        }
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
                let cellVal = this.matrix[row][col];
                let color = this.chooseColor(row, col, cellVal)
                
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
                    this.topContext.fillStyle = this.COINCOLOR;
                    this.topContext.fill();
                }

            }
        }

        this.renderUI()
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
        this.uiContext = this.getContext(this.WIDTH, this.HEIGHT, this.UICOLOR);
        this.outlineContext = this.getContext(0, 0, this.OUTLINECOLOR);
        this.topContext = this.getContext(0, 0, this.BACKGROUNDCOLOR, true);
        this.player = { x: 1, y: 1, color: this.PLAYERCOLOR, size: this.cellSize - 10 };
        this.matrix[this.player.y][this.player.x] = 2;

        this.num_goals = 3
        this.moveHistory = [];
        this.render();
    }
}
