// Initialize everything
var last_bomb_update = "";
function init() {
    // Get a reference to the canvas and indicate that we'll be working in 2D
    var canvas = document.getElementById("canvas");
    context = canvas.getContext("2d");

    // Get canvas dimensions
    WIDTH = canvas.width;
    HEIGHT = canvas.height;

    // Black borders (default)
    context.strokeStyle = "black";

    // For some reason, the canvas dimensions differ by one pixel when zooming in or out
	if (WIDTH != 800)
		WIDTH = 800;
	if (HEIGHT != 600)
		HEIGHT = 600;

    // Disable smoothness for pixelated effect
    context.webkitImageSmoothingEnabled = false;

    // Initialize players position only
    player[0].x = block_size; player[0].y = block_size;
    player[1].x = WIDTH-2*block_size; player[1].y = block_size;
    player[2].x = block_size; player[2].y = HEIGHT-2*block_size;
    player[3].x = WIDTH-2*block_size; player[3].y = HEIGHT-2*block_size;

    for(var i = 0; i<player.length;i++){
        player[i].alive = false;
    }
	
    for(var i = 0; i<player.length;i++){
        if (player[i].name != "")
            player[i].alive = true;

        player[i].velocity = 3;

        player[i].left = false;
        player[i].right = false;
        player[i].up = false;
        player[i].down = false;

        player[i].direction = "down";

        player[i].bombs = [];
        player[i].release_bomb = false;
        player[i].bomb_radius = 1;
        player[i].bomb_limit = 1;
    }
	
	board.level = clone(level[1]);

    paused = false;

    input();
}

// Game loop
function main() {
    session_bgm.pause();
    session_bgm.currentTime = 0;
	bgm.play();
    StartStopBool = requestAnimationFrame(main);
    update();
    draw();
	check_state();
    if (paused) {
        var pause_width = 140;
        var pause_height = 30;
        context.fillStyle = "rgba(100, 100, 100, 1)";
        draw_block((WIDTH-pause_width)/2, (HEIGHT-pause_height)/2, pause_width, pause_height);

        context.fillStyle = "rgba(255, 255, 255, 1)";
        context.font="25px Open Sans";
        context.fillText("PAUSE", (WIDTH-pause_width)/2+30, (HEIGHT-pause_height)/2+25, 500);
    }
}

function check_state(){
	var death_count = 0;
	for (var i = 0; i < player.length; i++) {
        if (player[i].name == "")
            player[i].alive = false;
		if (player[i].alive == true)
			death_count++;
	}
	//console.log(death_count);
	if (death_count <= 1){
		//console.log(StartStopBool);
		window.cancelAnimationFrame(StartStopBool);
		bgm.pause();
        bgm.currentTime = 0;
		HideGame();
		ShowEnding();
        if(player[playerid].alive)
            send("`E+");
        else
            send("`E-");
	}
}

// Handle input
function input() {
    document.addEventListener('keydown', function(event) {
        if (!paused)
            switch(event.keyCode) {
                case 37:    // left arrow
					if (player[playerid].left != true){
						send("-left");
					}
                    player[playerid].left = true;
                    break;
                case 38:    // up arrow
					if (player[playerid].up != true){
						send("-up");
					}
                    player[playerid].up = true;
                    break;
                case 39:    // right arrow
					if (player[playerid].right != true){
						send("-right");
					}
                    player[playerid].right = true;
                    break;
                case 40:    // down arrow
					if (player[playerid].down != true){
						send("-down");
					}
                    player[playerid].down = true;
                    break;
                case 32:    // space
                    if (player[playerid].bombs.length < player[playerid].bomb_limit && player[playerid].alive
                        && board.level[bitmap_position(player[playerid].y + player[playerid].sprite_height/2)][bitmap_position(player[playerid].x + player[playerid].sprite_width/2)]!=4){
                        var bomb_update = "*"+player[playerid].x+","+player[playerid].y;
                        if(bomb_update!=last_bomb_update){
                            last_bomb_update = bomb_update;
                            send(bomb_update);    
                        }
					}
					//level[1][0],console.log(level[1][0], level[1][1], level[1][2],level[1][3],level[1][4],level[1][5],level[1][6],level[1][7]);

                    break;
                default:
                    break;
            }
    });

    document.addEventListener('keyup', function(event) {
        switch(event.keyCode) {
            case 37:    // left arrow
				//send(playerid + "   " + player[playerid].x + "  " + player[playerid].y);
				if (player[playerid].left != false){
					send("-stop_left");
				}
                player[playerid].left = false;
                player[playerid].frame["left"] = 0;
                send("&"+player[playerid].x.toString()+","+player[playerid].y.toString());
                break;
            case 38:    // up arrow
				//send(playerid + "   " + player[playerid].x + "  " + player[playerid].y);
				if (player[playerid].up != false){
					send("-stop_up");
				}
                player[playerid].up = false;
                player[playerid].frame["up"] = 0;
                send("&"+player[playerid].x.toString()+","+player[playerid].y.toString());
                break;
            case 39:    // right arrow
				//send(playerid + "   " + player[playerid].x + "  " + player[playerid].y);
				if (player[playerid].right != false){
					send("-stop_right");
				}
                player[playerid].right = false;
                player[playerid].frame["right"] = 12;
                send("&"+player[playerid].x.toString()+","+player[playerid].y.toString());
                break;
            case 40:    // down arrow
				//send(playerid + "   " + player[playerid].x + "  " + player[playerid].y);
				if (player[playerid].down != false){
					send("-stop_down");
				}
                player[playerid].down = false;
                player[playerid].frame["down"] = 0;
                send("&"+player[playerid].x.toString()+","+player[playerid].y.toString());
                break;
            default:
                break;
        }
    });

}

// Update game state
function update() {
    for (var i = 0; i < player.length; i++) {

        //Remove exploded bombs (which can happen even when the player is dead)
        if (typeof(player[i].bombs[0]) != "undefined" && player[i].bombs[0].extinguished)
            player[i].bombs.shift();

        //Update bomb state (which can happen even when the player is dead)
        for (var j = 0; j < player[i].bombs.length; j++)
            player[i].bombs[j].update();

        if (player[i].alive) {

            // Update player position and sprite animation
            player[i].move();

            // Check if player is stepping on a power-up and have him pick it up
            var board_x = bitmap_position(player[i].x + player[i].sprite_width/2);
            var board_y = bitmap_position(player[i].y + player[i].sprite_height/2);
            var power_up = board.board_powerups[board_y][board_x];
            if (power_up != 0 && i == playerid) {
                send("!"+playerid+player[i].x + ","+player[i].y +","+power_up);
                board.board_powerups[board_y][board_x] = 0;
                player[i].add_power_up(power_up);
            }
        }
    }
    //RefreshMap();
}

function draw() {
	//log(player[0].x + "  " + player[0].y);
    // Clear screen (erase everything)
    context.clearRect(0, 0, WIDTH, HEIGHT);

    // Fill background with pitch black
    context.fillStyle = "rgba(0, 0, 0, 1)";
    draw_block(0, 0, WIDTH, HEIGHT);

    // Draw power_ups
    for (var i = 0; i < board.height; i++)
        for (var j = 0; j < board.width; j++) {
            var powerup = board.board_powerups[i][j];
            if (powerup != 0 && board.level[i][j] == 0) {
                var sprite = fetch_sprite(board.powerups[powerup]);
                context.drawImage(powerups_sprite, sprite[0], sprite[1], sprite[2], sprite[3], pixel_position(j), pixel_position(i), sprite[2]*(block_size/sprite[3]), block_size);
            }
        }

    // Draw blocks
    for (var i = 0; i < 20; i++)
        for (var j = 0; j < 15; j++)
            if (board.level[j][i] == 1) {
                context.fillStyle = "rgba(255, 255, 255, 1)";
                draw_block(pixel_position(i), pixel_position(j), block_size, block_size);
            }
            else if (board.level[j][i] == 2) {
                context.fillStyle = "rgba(93, 44, 93, 1)";
                draw_block(pixel_position(i), pixel_position(j), block_size, block_size);
            }
            else if (board.level[j][i] == 4) {
                context.fillStyle = "orange";
                draw_block(pixel_position(i), pixel_position(j), block_size, block_size);
            }

    // Draw bombs
    for (var i = 0; i < player.length; i++)
        for (var j = 0; j < player[i].bombs.length; j++)
            player[i].bombs[j].draw();


    // Draw players
    for (var i = 0; i < player.length; i++)
        if (player[i].alive == true&&player[i].name != "")
            player[i].draw();

    // Draw ping
    context.font = "15px Consolas";
    context.textAlign="left";
    if(ping < 0){
        context.fillStyle = "orange";
        context.fillText("ping: estimating...",5,25);
    }
    else if(ping<=150){
        context.fillStyle = "SpringGreen";
        context.fillText("ping: "+ping+"ms",5,25);
    }
    else if(ping<=300){
        context.fillStyle = "yellow";
        context.fillText("ping: "+ping+"ms",5,25);
    }
    else{
        context.fillStyle = "red";
        context.fillText("ping: "+ping+"ms",5,25);
    }
}

function InitGameBoard(){
    board = new Board(20, 15, 1);
    board.init_power_ups(); //In board.js
}

function SendPowerUps(){
    board.load_power_ups();
    for (var i = 0; i < board.height; i++){
        for (var j = 0; j < board.width; j++){
            if(board.board_powerups[i][j]!=0)
                send("/"+board.board_powerups[i][j].toString()+","+i.toString()+","+j.toString());
        }
    }
}

function GeneratePowerUps(message){
    powerups_type_position = message.split(",");
    board.board_powerups[parseInt(powerups_type_position[1])][parseInt(powerups_type_position[2])] = parseInt(powerups_type_position[0]);
}

function RefreshMap(){
    for(var i = 0; i<4;i++){
        if(player[i].bombs.length!=0)
            return;
    }
    for (var i = 0; i < board.height; i++){
        for (var j = 0; j < board.width; j++){
            if(board.level[i][j] == 4){
                board.level[i][j] = 0;
            }
        }
    }
}

function add_bomb(payload){
        var message = payload.substring(2);
        var bomb_position = message.split(",");

        //Update player position (safe check)
        // player[parseInt(payload[1])].x = parseInt(bomb_position[0]);
        // player[parseInt(payload[1])].y = parseInt(bomb_position[1]);     

        // Bombs are placed on board tiles according to the position of the center of the player
        player[playerid].release_bomb = true;  
        var x_bomb = pixel_position(bitmap_position(parseInt(bomb_position[0]) + player[parseInt(payload[1])].sprite_width/2));
        var y_bomb = pixel_position(bitmap_position(parseInt(bomb_position[1]) + player[parseInt(payload[1])].sprite_height/2));
        dropbomb.play();
        board.level[bitmap_position(parseInt(bomb_position[1]) + player[parseInt(payload[1])].sprite_height/2)][bitmap_position(parseInt(bomb_position[0]) + player[parseInt(payload[1])].sprite_width/2)] = 4;
        // Add bomb to the player's set of "released bombs"
        player[parseInt(payload[1])].bombs.push(new Bomb(bomb_sprite,
                            explosion_sprite,
                            x_bomb,
                            y_bomb,
                            player[parseInt(payload[1])].bomb_radius)); 
        player[parseInt(payload[1])].release_bomb = false;
        last_bomb_update = "";
        // if(parseInt(payload[1]) == playerid)
        //     SendGameState();
}