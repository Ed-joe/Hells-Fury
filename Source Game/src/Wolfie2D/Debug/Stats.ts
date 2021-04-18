import Color from "../Utils/Color";

// @ignorePage
export default class Stats extends Object {
    // The fps of the game.
    private static prevfps: Array<number>;
    private static readonly NUM_POINTS: number = 60;
    private static ctx: CanvasRenderingContext2D;
    private static CANVAS_WIDTH: number = 300;
    private static CANVAS_HEIGHT: number = 300;
    private static statsDiv: HTMLDivElement;
    private static graphChoices: HTMLSelectElement;

    // Quadtree stats
    private static prevClearTimes: Array<number>;
    private static SGClearTimes: Array<number>;
    private static avgSGClearTime: number;

    private static prevFillTimes: Array<number>;
    private static SGFillTimes: Array<number>;
    private static avgSGFillTime: number;

    private static prevUpdateTimes: Array<number>;
    private static SGUpdateTimes: Array<number>;
    private static avgSGUpdateTime: number;

    private static prevQueryTimes: Array<number>;
    private static SGQueryTimes: Array<number>;
    private static avgSGQueryTime: number;

    static initStats(): void {
        let canvas = <HTMLCanvasElement>document.getElementById("stats-canvas");
        canvas.width = this.CANVAS_WIDTH;
        canvas.height = this.CANVAS_HEIGHT;
        this.ctx = canvas.getContext("2d");

        this.statsDiv = <HTMLDivElement>document.getElementById("stats-display");

        this.prevfps = new Array();

        this.prevClearTimes = new Array();
        this.SGClearTimes = new Array();
        this.avgSGClearTime = 0;

        this.prevFillTimes = new Array();
        this.SGFillTimes = new Array();
        this.avgSGFillTime = 0;

        this.prevUpdateTimes = new Array();
        this.SGUpdateTimes = new Array();
        this.avgSGUpdateTime = 0;

        this.prevQueryTimes = new Array();
        this.SGQueryTimes = new Array();
        this.avgSGQueryTime = 0;

        let clearTime = document.createElement("span");
        clearTime.setAttribute("id", "sgclear");
        let fillTime = document.createElement("span");
        fillTime.setAttribute("id", "sgfill");
        let updateTime = document.createElement("span");
        updateTime.setAttribute("id", "sgupdate");
        let queryTime = document.createElement("span");
        queryTime.setAttribute("id", "sgquery");
        let br1 = document.createElement("br");
        let br2 = document.createElement("br");
        let br3 = document.createElement("br");

        this.statsDiv.append(clearTime, br1, fillTime, br2, updateTime, br3, queryTime);

        this.graphChoices = <HTMLSelectElement>document.getElementById("chart-option");
        let option1 = document.createElement("option");
        option1.value = "prevfps";
        option1.label = "FPS";
        let option2 = document.createElement("option");
        option2.value = "prevClearTimes";
        option2.label = "Clear Time";
        let option3 = document.createElement("option");
        option3.value = "prevFillTimes";
        option3.label = "Fill time";
        let option4 = document.createElement("option");
        option4.value = "prevUpdateTimes";
        option4.label = "Update time";
        let option5 = document.createElement("option");
        option5.value = "prevQueryTimes";
        option5.label = "Query Time";
        let optionAll = document.createElement("option");
        optionAll.value = "all";
        optionAll.label = "All";
        this.graphChoices.append(option1, option2, option3, option4, option5, optionAll);
    }

    static updateFPS(fps: number): void {
        this.prevfps.push(fps);
        if(this.prevfps.length > Stats.NUM_POINTS){
            this.prevfps.shift();
        }

        if(this.SGClearTimes.length > 0){
            this.prevClearTimes.push(this.avgSGClearTime);
            if(this.prevClearTimes.length > this.NUM_POINTS){
                this.prevClearTimes.shift();
            }
        }
        if(this.SGFillTimes.length > 0){
            this.prevFillTimes.push(this.avgSGFillTime);
            if(this.prevFillTimes.length > this.NUM_POINTS){
                this.prevFillTimes.shift();
            }
        }
        if(this.SGUpdateTimes.length > 0){
            this.prevUpdateTimes.push(this.avgSGUpdateTime);
            if(this.prevUpdateTimes.length > this.NUM_POINTS){
                this.prevUpdateTimes.shift();
            }
        }
        if(this.SGQueryTimes.length > 0){
            this.prevQueryTimes.push(this.avgSGQueryTime);
            if(this.prevQueryTimes.length > this.NUM_POINTS){
                this.prevQueryTimes.shift();
            }
        }

        this.updateSGStats();
    }

    static log(key: string, data: any): void {
        if(key === "sgclear"){
            this.SGClearTimes.push(data);
            if(this.SGClearTimes.length > 100){
                this.SGClearTimes.shift();
            }
        } else if(key === "sgfill"){
            this.SGFillTimes.push(data);
            if(this.SGFillTimes.length > 100){
                this.SGFillTimes.shift();
            }
        } else if(key === "sgupdate"){
            this.SGUpdateTimes.push(data);
            if(this.SGUpdateTimes.length > 100){
                this.SGUpdateTimes.shift();
            }
        } else if(key === "sgquery"){
            this.SGQueryTimes.push(data);
            if(this.SGQueryTimes.length > 1000){
                this.SGQueryTimes.shift();
            }
        }

    }

    static render(): void {
        // Display stats
        this.drawCharts();
    }

    static drawCharts(){
        this.ctx.clearRect(0, 0, this.CANVAS_WIDTH, this.CANVAS_HEIGHT);

        let paramString = this.graphChoices.value;

        if(paramString === "prevfps" || paramString === "all"){
            let param = this.prevfps;
            let color = Color.BLUE.toString();
            this.drawChart(param, color);
        }
        if(paramString === "prevClearTimes" || paramString === "all"){
            let param = this.prevClearTimes;
            let color = Color.RED.toString();
            this.drawChart(param, color);
        }
        if(paramString === "prevFillTimes" || paramString === "all"){
            let param = this.prevFillTimes;
            let color = Color.GREEN.toString();
            this.drawChart(param, color);
        }
        if(paramString === "prevUpdateTimes" || paramString === "all"){
            let param = this.prevUpdateTimes;
            let color = Color.CYAN.toString();
            this.drawChart(param, color);
        }
        if(paramString === "prevQueryTimes" || paramString === "all"){
            let param = this.prevQueryTimes;
            let color = Color.ORANGE.toString();
            this.drawChart(param, color);
        }
    }

    static drawChart(param: Array<number>, color: string){
        this.ctx.strokeStyle = Color.BLACK.toString();
        this.ctx.beginPath();
        this.ctx.moveTo(10, 10);
        this.ctx.lineTo(10, this.CANVAS_HEIGHT - 10);
        this.ctx.closePath();
        this.ctx.stroke();
        this.ctx.beginPath();
        this.ctx.moveTo(10, this.CANVAS_HEIGHT - 10);
        this.ctx.lineTo(this.CANVAS_WIDTH - 10, this.CANVAS_HEIGHT - 10);
        this.ctx.closePath();
        this.ctx.stroke();

        let max = Math.max(...param);
        let prevX = 10;
        let prevY = this.CANVAS_HEIGHT - 10 - param[0]/max*(this.CANVAS_HEIGHT-20);
        this.ctx.strokeStyle = color;

        for(let i = 1; i < param.length; i++){
            let fps = param[i];
            let x = 10 + i*(this.CANVAS_WIDTH - 20)/this.NUM_POINTS;
            let y = this.CANVAS_HEIGHT - 10 - fps/max*(this.CANVAS_HEIGHT-20)
            this.ctx.beginPath();
            this.ctx.moveTo(prevX, prevY);
            this.ctx.lineTo(x, y);
            this.ctx.closePath();
            this.ctx.stroke();

            prevX = x;
            prevY = y;
        }
    }

    static updateSGStats(){
        if(this.SGClearTimes.length > 0){
            this.avgSGClearTime = this.SGClearTimes.reduce((acc, val) => acc + val)/this.SGClearTimes.length;
        }

        if(this.SGFillTimes.length > 0){
            this.avgSGFillTime = this.SGFillTimes.reduce((acc, val) => acc + val)/this.SGFillTimes.length;
        }

        if(this.SGUpdateTimes.length > 0){
        this.avgSGUpdateTime = this.SGUpdateTimes.reduce((acc, val) => acc + val)/this.SGUpdateTimes.length;
        }

        if(this.SGQueryTimes.length > 0){
            this.avgSGQueryTime = this.SGQueryTimes.reduce((acc, val) => acc + val)/this.SGQueryTimes.length;
        }

        document.getElementById("sgclear").innerHTML = "Avg SG clear time: " + this.avgSGClearTime;
        document.getElementById("sgfill").innerHTML = "Avg SG fill time: " + this.avgSGFillTime;
        document.getElementById("sgupdate").innerHTML = "Avg SG update time: " + this.avgSGUpdateTime;
        document.getElementById("sgquery").innerHTML = "Avg SG query time: " + this.avgSGQueryTime;
    }
}