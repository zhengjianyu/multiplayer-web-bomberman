
function Board(width, height, level_number) {

    // Board dimensions
    this.width = width;
    this.height = height;

    // Load white and blue blocks of the specified level
    this.level = clone(level[level_number]);

    // Not all power-ups have been implemented yet
    this.powerups = {
        1: "fire",
        2: "skate",
        3: "geta",
        4: "bomb"
    }

    //this.powerups = {
        //1: "power_glove",
        //2: "boxing_glove",
        //3: "fire",
        //4: "skate",
        //5: "line_bomb",
        //6: "vest",
        //7: "skull",
        //8: "geta",
        //9: "kick",
        //10: "bomb"
    //};

    // Create 2D array that will store generated power-ups (same dimensions as board of blocks)
    this.board_powerups = create_2D_array(height, width);

    // Randomly distribute power-ups across board
    //this.load_power_ups();
}

Board.prototype.init_power_ups = function(){
    for (var i = 0; i < this.height; i++)
        for (var j = 0; j < this.width; j++)
            this.board_powerups[i][j] = 0;
}

// Generate power-ups under 1/5th of the white blocks only
Board.prototype.load_power_ups = function() {
    for (var i = 0; i < this.height; i++)
        for (var j = 0; j < this.width; j++)
            if (Math.floor(Math.random()*5) == 0 && this.level[i][j] == 1){
                //this.board_powerups[i][j] = 4;
                this.board_powerups[i][j] = Math.floor(Math.random()*4)+1;
            }
            else
                this.board_powerups[i][j] = 0;
}


function clone(maplevel){
	var result = [];
	for (var i = 0; i < maplevel.length; i++){
		var innerlist = [];
		for (var j = 0; j < maplevel[i].length; j++){
			innerlist.push(maplevel[i][j]);
		}
		result.push(innerlist);
	}
	//console.log(result);
	return result;
}
