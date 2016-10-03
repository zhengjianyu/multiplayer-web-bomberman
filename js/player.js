
function Player(sprite_sheet, name, ready,host, x, y) {
    this.sprite_sheet = sprite_sheet;
    this.name = name;
    //this.number = number;   // unused
    this.ready = ready;
    this.host = host;

    this.x = x+6;   // arbitrary addition to center the player inside the corresponding tile
    this.y = y;

    this.alive = false;
    this.invincible = false;    // unused (waiting for "vest" to be implemented)

    this.velocity = 3;

    this.sprite_width = null;
    this.sprite_height = null;

    // Indicated whether player is moving in a certain direction
    this.left = false;
    this.right = false;
    this.up = false;
    this.down = false;

    // Movement direction
    this.direction = "down";

    // Sprite animation
    this.frame = new Array(4);
    this.frame["left"] = 0;
    this.frame["up"] = 0;
    this.frame["right"] = 0;
    this.frame["down"] = 0;

    // Bomb information
    this.bombs = [];
    this.release_bomb = false;
    this.bomb_radius = 1;
    this.bomb_limit = 1;

    this.set_player_position = function(payload){
        var position = payload.split(",");
        this.x = parseInt(position[0]);
        this.y = parseInt(position[1]);
    }
}

Player.prototype.move = function() {

    // Update position
    if (this.left)
        this.x -= this.velocity;
    else if (this.right)
        this.x += this.velocity;
    else if (this.up)
        this.y -= this.velocity;
    else if (this.down)
        this.y += this.velocity;

    // Collision detection (rectifies coordinates)
    var board_x_left = bitmap_position(this.x);
    var board_x_right = bitmap_position(this.x+this.sprite_width-1);
    var board_y_up = bitmap_position(this.y);
    var board_y_down = bitmap_position(this.y+this.sprite_height-1);

    var top_left_collision = board.level[board_y_up][board_x_left] >= 1 && board.level[board_y_up][board_x_left] <= 3;
    var top_right_collision = board.level[board_y_up][board_x_right] >= 1 && board.level[board_y_up][board_x_right] <= 3;
    var bottom_left_collision = board.level[board_y_down][board_x_left] >= 1 && board.level[board_y_down][board_x_left] <= 3;
    var bottom_right_collision = board.level[board_y_down][board_x_right] >= 1 && board.level[board_y_down][board_x_right] <= 3;

    var bomb_top_left = board.level[board_y_up][board_x_left] == 4;
    var bomb_top_right = board.level[board_y_up][board_x_right] == 4;
    var bomb_bottom_left = board.level[board_y_down][board_x_left] == 4;
    var bomb_bottom_right = board.level[board_y_down][board_x_right] == 4;

	var bomb_top_left_left = board.level[board_y_up][board_x_left-1] == 4;
	var bomb_top_right_right = board.level[board_y_up][board_x_right+1] ==4;
	var bomb_bottom_left_left = board.level[board_y_down][board_x_left-1] ==4;
	var bomb_bottom_right_right = board.level[board_y_down][board_x_right+1] == 4;
	
	var bomb_top_top_left = board.level[board_y_up][board_x_left] == 4;
	var bomb_top_top_right = board.level[board_y_up][board_x_right] == 4;
	var bomb_bottom_bottom_left = board.level[board_y_down][board_x_left] ==4;
	var bomb_bottom_bottom_right = board.level[board_y_down][board_x_right] ==4;

	var bomb_left = board.level[bitmap_position(this.y)][bitmap_position(this.x)-1] == 4;
	var bomb_right = board.level[bitmap_position(this.y)][bitmap_position(this.x)+1] == 4;
	if(bitmap_position(this.y)==0){
		var bomb_top = board.level[bitmap_position(this.y)][bitmap_position(this.x)] == 4;
		var bomb_bottom = board.level[bitmap_position(this.y)+2][bitmap_position(this.x)] == 4;
	}
	else if(bitmap_position(this.y)==13){
		var bomb_top = board.level[bitmap_position(this.y)-1][bitmap_position(this.x)] == 4;
		var bomb_bottom = board.level[bitmap_position(this.y)][bitmap_position(this.x)] == 4;
	}
	else{
		var bomb_top = board.level[bitmap_position(this.y)-1][bitmap_position(this.x)] == 4;
		var bomb_bottom = board.level[bitmap_position(this.y)+2][bitmap_position(this.x)] == 4;
	}

    //Bomb overlapping handling
    if (board.level[bitmap_position(this.y + this.sprite_height/2)][bitmap_position(this.x + this.sprite_width/2)]==4){

    	if (this.left && !top_left_collision && !bottom_left_collision && !bomb_left)
            this.x -= this.velocity;
        else if (this.right && !top_right_collision && !bottom_right_collision && !bomb_right)
            this.x += this.velocity;
        else if (this.up && !top_left_collision && !top_right_collision && !bomb_top)
            this.y -= this.velocity;
        else if (this.down && !bottom_left_collision && !bottom_right_collision && !bomb_bottom)
            this.y += this.velocity;

    	// Slide on corners
        if (this.left) {
            if (top_left_collision || bomb_top_left) {
                if (board.level[board_y_up+1][board_x_left] == 0 && board.level[board_y_up+1][board_x_left-1] == 0)
                    this.y++;
            }

            else if (bottom_left_collision || bomb_bottom_left) {
                if (board.level[board_y_down-1][board_x_left] == 0 && board.level[board_y_down-1][board_x_left-1] == 0)
                    this.y--;
            }
        }

        else if (this.right) {
            if (top_right_collision || bomb_top_right) {
                if (board.level[board_y_up+1][board_x_right] == 0 && board.level[board_y_up+1][board_x_right+1] == 0)
                    this.y++;
            }

            else if (bottom_right_collision || bomb_bottom_right) {
                if (board.level[board_y_down-1][board_x_right] == 0 && board.level[board_y_down-1][board_x_right+1] == 0)
                    this.y--;
            }
        }

        else if (this.up) {
            if (top_left_collision || bomb_top_left) {
                if (board.level[board_y_up][board_x_left+1] == 0 && board.level[board_y_up-1][board_x_left+1] == 0)
                    this.x++;
            }

            else if (top_right_collision || bomb_top_right) {
                if (board.level[board_y_up][board_x_right-1] == 0 && board.level[board_y_up-1][board_x_right-1] == 0)
                    this.x--;
            }
        }

        else if (this.down) {
            if (bottom_left_collision || bomb_bottom_left) {
                if (board.level[board_y_down][board_x_left+1] == 0 && board.level[board_y_down+1][board_x_left+1] == 0)
                    this.x++;
            }

            else if (bottom_right_collision || bomb_bottom_right) {
                if (board.level[board_y_down][board_x_right-1] == 0 && board.level[board_y_down+1][board_x_right-1] == 0)
                    this.x--;
            }
        }
    }


    if (this.left) {
        if (top_left_collision || bottom_left_collision || bomb_top_left || bomb_bottom_left) {
            this.x += this.velocity;
            board_x_left = bitmap_position(this.x);
        }
    }

    else if (this.right) {
        if (top_right_collision || bottom_right_collision || bomb_top_right || bomb_bottom_right) {
            this.x -= this.velocity;
            board_x_right = bitmap_position(this.x+this.sprite_width-1);
        }
    }

    else if (this.up) {
        if (top_left_collision || top_right_collision || bomb_top_left || bomb_top_right) {
            this.y += this.velocity;
            board_y_up = bitmap_position(this.y);
        }
    }

    else if (this.down) {
        if (bottom_left_collision || bottom_right_collision || bomb_bottom_left || bomb_bottom_right) {
            this.y -= this.velocity;
            board_y_down = bitmap_position(this.y+this.sprite_height-1);
        }
    }

    // Slide on corners
    if (this.left) {
        if (top_left_collision ||bomb_top_left) {
            if (board.level[board_y_up+1][board_x_left] == 0 && board.level[board_y_up+1][board_x_left-1] == 0)
                this.y++;
        }

        else if (bottom_left_collision || bomb_bottom_left) {
            if (board.level[board_y_down-1][board_x_left] == 0 && board.level[board_y_down-1][board_x_left-1] == 0)
                this.y--;
        }
    }

    else if (this.right) {
        if (top_right_collision || bomb_top_right) {
            if (board.level[board_y_up+1][board_x_right] == 0 && board.level[board_y_up+1][board_x_right+1] == 0)
                this.y++;
        }

        else if (bottom_right_collision || bomb_bottom_right) {
            if (board.level[board_y_down-1][board_x_right] == 0 && board.level[board_y_down-1][board_x_right+1] == 0)
                this.y--;
        }
    }

    else if (this.up) {
        if (top_left_collision || bomb_top_left) {
            if (board.level[board_y_up][board_x_left+1] == 0 && board.level[board_y_up-1][board_x_left+1] == 0)
                this.x++;
        }

        else if (top_right_collision || bomb_top_right) {
            if (board.level[board_y_up][board_x_right-1] == 0 && board.level[board_y_up-1][board_x_right-1] == 0)
                this.x--;
        }
    }

    else if (this.down) {
        if (bottom_left_collision || bomb_bottom_left) {
            if (board.level[board_y_down][board_x_left+1] == 0 && board.level[board_y_down+1][board_x_left+1] == 0)
                this.x++;
        }

        else if (bottom_right_collision || bomb_bottom_right) {
            if (board.level[board_y_down][board_x_right-1] == 0 && board.level[board_y_down+1][board_x_right-1] == 0)
                this.x--;
        }
    }

    // Update animation frames
    if (this.left) {
        this.direction = "left";
        this.frame["left"] = (++this.frame["left"])%13;
    }
    else if (this.right) {
        this.direction = "right";
        this.frame["right"] = (++this.frame["right"])%13;
    }
    else if (this.up) {
        this.direction = "up";
        this.frame["up"] = (++this.frame["up"])%13;
    }
    else if (this.down) {
        this.direction = "down";
        this.frame["down"] = (++this.frame["down"])%13;
    }
}

Player.prototype.draw = function() {

    var sprite = [];

    switch (this.direction) {
        case "left":
            if (this.frame["left"] <= 4)
                sprite = fetch_sprite("horizontal_walk_1");
            else if (this.frame["left"] <= 8)
                sprite = fetch_sprite("horizontal_walk_2");
            else if (this.frame["left"] <= 12)
                sprite = fetch_sprite("horizontal_walk_3");
            break;

        case "up":
            if (this.frame["up"] <= 4)
                sprite = fetch_sprite("vertical_walk_4");
            else if (this.frame["up"] <= 8)
                sprite = fetch_sprite("vertical_walk_5");
            else if (this.frame["up"] <= 12)
                sprite = fetch_sprite("vertical_walk_6");
            break;

        case "right":
            if (this.frame["right"] <= 4)
                sprite = fetch_sprite("horizontal_walk_4");
            else if (this.frame["right"] <= 8)
                sprite = fetch_sprite("horizontal_walk_5");
            else if (this.frame["right"] <= 12)
                sprite = fetch_sprite("horizontal_walk_6");
            break;

        case "down":
            if (this.frame["down"] <= 4)
                sprite = fetch_sprite("vertical_walk_1");
            else if (this.frame["down"] <= 8)
                sprite = fetch_sprite("vertical_walk_2");
            else if (this.frame["down"] <= 12)
                sprite = fetch_sprite("vertical_walk_3");
            break;
        default:
            sprite = fetch_sprite("horizontal_walk_1");
            break;
    }

    this.sprite_width = Math.floor(sprite[2]*(block_size/sprite[3]));
    this.sprite_height = block_size;
    context.drawImage(this.sprite_sheet, sprite[0], sprite[1], sprite[2], sprite[3], this.x, this.y, this.sprite_width, block_size);

    context.textAlign="center";
    if(this.name!=""){
        if(this.name == player[0].name)
            context.fillStyle = "white";
        else if(this.name == player[1].name)
            context.fillStyle = "grey";
        else if(this.name == player[2].name)
            context.fillStyle = "red";
        else if(this.name == player[3].name)
            context.fillStyle = "cyan";
        context.fillText(this.name,this.x+13,this.y-5);
    }
}

// Kill the player if he is not invincible
Player.prototype.kill = function() {
    if (this.invincible == false){
		if (this.alive == true){
			p1death.play(); //---------------------------added sound here
        	this.alive = false;
		}
	}
}

Player.prototype.add_power_up = function(power_up) {
    switch(power_up) {
        case 1:
            // Increases fire range by 1
			item_fire.play();
            console.log("fire");
            this.bomb_radius++;
            break;
        case 2:
            // Increases player's speed by 1
			item_speed.play();
            console.log("skate");
            this.velocity++;
            break;
        case 3:
			item_geta.play();
            console.log("geta");
            if (this.velocity > 1)
                this.velocity--;
            break;
        case 4:
			item_bomb.play();
            console.log("bomb");
            this.bomb_limit++;
            break;
    }
}