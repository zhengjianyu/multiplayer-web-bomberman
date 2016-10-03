var initialized = false; // detect if the connection is still established
var connected = false;
var disconnected = false;

var send_time = 0;
var receive_time = 0;
var ping = -1000;

function log( text ) {
	$log = $('#log');
	//Add text to log
	$log.append(($log.val()?"\n":'')+text);
	//Autoscroll
	$log[0].scrollTop = $log[0].scrollHeight - $log[0].clientHeight;
}

function namelist( text ) {
	$namelist = $('#namelist');
	//Add text to log
	$namelist.append(($namelist.val()?"\n":'')+text);
	//Autoscroll
	$namelist[0].scrollTop = $namelist[0].scrollHeight - $namelist[0].clientHeight;
}

function send( text ) {
	Server.send( 'message', text );
}

function connect(){
	if(document.getElementById('username').value==""){
		alert("Please enter username!");
		return;
	}
	if(document.getElementById('password').value==""){
		alert("Please enter password!")
		return;
	}
	if(document.getElementById('username').value.search(",")!=-1 ||document.getElementById('password').value.search(",")!=-1 ){
		alert("No speical characters allowed in username/password!");
		return;
	}
	client_username = document.getElementById('username').value;
	
	// Server = new FancyWebSocket('ws://' + document.getElementById('ip').value + ':' + document.getElementById('port').value);
	Server = new FancyWebSocket('ws://' + ip + ':' + port);
	log('Connecting...');

	//Let the user know we're connected
	Server.bind('open', function() {
		document.getElementById("cntBtn").disabled = true;
		send(">"+document.getElementById('username').value+","+document.getElementById('password').value);//Send userdata
		log( "Connected." );
	});

	//OH NOES! Disconnection occurred.
	Server.bind('close', function( data ) {
		if(connected == true){
			connected = false;
			disconnected = true;
			ping = -1000;
			DisconnecitonAlert();
		}
		document.getElementById("cntBtn").disabled = false;
		log("Disconnected.");
	});

	//Log any messages sent from server
	Server.bind('message', function( payload ) {

		//--------------------------------------------------------------------------------
		if(payload[0] == '>'){//Session Handling
			if(payload[1] == '+'){//Granted open seesion
				initialized = true;
				connected = true;
				disconnected = false;
				login = true;
				HideIntro();
				ShowSession();
				session_bgm.loop = true;
				session_bgm.play();
			}
			else if(payload[1] == 'U'){//Session Info update
				var update = payload.substring(2);
				var all_sessions = update.split("|");
				for(var i = 0; i<all_sessions.length;i++){
					var session_update = all_sessions[i].split(",");
					sessions[i].room_name = session_update[0];
					sessions[i].current_players = parseInt(session_update[1]);
					sessions[i].waiting = parseInt(session_update[2]);
					sessions[i].running = parseInt(session_update[3]);
					sessions[i].room_password = session_update[4];
				}
				// if(document.getElementById('session').innerHTML != "");
				draw_SessionCanvas();
			}
			else if(payload[1] == 'N'){//Deny lobby entrance due to unregister username
				alert("Username is not found, please register it.");
			}
			else if(payload[1] == 'P'){//Deny lobby entrance due to incorrect password
				alert("Password is incorrect.");
			}
			else if(payload[1] == 'M'){//Deny lobby entrance due to multiple login
				alert("This user is already login.");
			}
			else{//Deny create room request
				alert("No available space for room.");
			}
		}

		else if(payload[0]==']'){//Joining session handling
			if(payload[1]=='P'){//Asking for password for the room
				var the_room_password = prompt("Enter the password for room: "+ sessions[parseInt(payload.substring(2))].room_name);
				if(the_room_password!=null)
					send("]]"+payload.substring(2)+client_username+","+the_room_password);
			}
			else if(payload[1] == '-'){//Get dennyed due to wrong password
				alert("Password is incorrect, entrance dennyed.");
			}
		}

		else if(payload[0]=='@'){//Lobby handling

			if(payload[1]=='+'){//Granted open lobby
				HideSession();
				ShowLobby();
				playerid = parseInt(payload[2]);//Acknowledge the client by playerid
				log("Connected.")
			}
			else if(payload[1]=='U'){//Updating PlayersInfo
				//log(payload);
				var PlyaersInfo = payload.split("|");
				for(i = 1; i<PlyaersInfo.length;i++){
					var info = PlyaersInfo[i].split(",");
					player[parseInt(info[0])].name = info[1];
					player[parseInt(info[0])].ready = parseInt(info[2]);
					player[parseInt(info[0])].host = parseInt(info[3]);
					//log(player[parseInt(info[0])].name+","+player[parseInt(info[0])].ready+","+player[parseInt(info[0])].host);
				}
				if(player[playerid].host==1){
					document.getElementById('strbtn').textContent = "Start Game";
					document.getElementById('strbtn').disabled = true;
					document.getElementById('invBtn').disabled = false;
				}
				else{
					document.getElementById('strbtn').textContent = "Ready";
				}
				draw_LobbyCanvas();//Update canvas

			}
		}

		//--------------------------------------------------------------------------------
		else if(payload[0] == '$'){//Invite Handling
			if(payload[1] == '<')//User not found
				alert("This player is not found.");
			else if(payload[1] == '>')//User is already in session
				alert("This player is already in a room.");
			else if(payload[1] == '.'){//Asking confirmation for joining the room
				//alert(payload);
				var host_room = payload.substring(2).split(",");
				InviteConfirm(host_room[0],parseInt(host_room[1]));
			}
			else if(payload[1] == '-'){//Tell host player deny inviate
				alert("This player dennyed your invitation.");
			}
			else if(payload[1] == '#'){//Tell invited player session is full
				alert("The room is full or doesn't exist.")
			}
		}
		//--------------------------------------------------------------------------------
		else if(payload[0] =='`'){//Granted start game permission to host 
			document.getElementById('strbtn').disabled = false;
		}
		//--------------------------------------------------------------------------------
		else if(payload[0]=='~'){//Game start handling
			if(payload[1]=='S'){
				StartGame();//Defined in scene.js (Subject to change)
			}
		}
		else if(payload[0] == '-'){ //direction handling
			var direction = payload.substring(2);
			//--------------------------------------------------------------------------------
			if (direction == "down")
				player[parseInt(payload[1])].down = true;
			if (direction == "up")
				player[parseInt(payload[1])].up = true;
			if (direction == "left")
				player[parseInt(payload[1])].left = true;
			if (direction == "right")
				player[parseInt(payload[1])].right = true;
			//--------------------------------------------------------------------------------
			if (direction == "stop_down"){
				player[parseInt(payload[1])].down = false;
				player[parseInt(payload[1])].frame["down"] = 0;
			}
			if (direction == "stop_up"){
				player[parseInt(payload[1])].up = false;
				player[parseInt(payload[1])].frame["up"] = 0;
			}
			if (direction == "stop_left"){
				player[parseInt(payload[1])].left = false;
				player[parseInt(payload[1])].frame["left"] = 0;
			}
			if (direction == "stop_right"){
				player[parseInt(payload[1])].right = false;
				player[parseInt(payload[1])].frame["right"] = 12;
			}
			
		}
		else if(payload[0] == '&'){ //Player position handling
			var message = payload.substring(2);
			player[parseInt(payload[1])].set_player_position(message);
		}

		else if(payload[0] == '*'){ //Bomb position handling
			// var message = payload.substring(2);
			// var bomb_position = message.split(",");

			// //Update player position (safe check)
			// player[parseInt(payload[1])].x = parseInt(bomb_position[0]);
			// player[parseInt(payload[1])].y = parseInt(bomb_position[1]);

			// player[parseInt(payload[1])].release_bomb = true;		
			// last_bomb_update = "";
			player[parseInt(payload[1])].release_bomb = true;  
			add_bomb(payload);
		}

		else if(payload[0] == '/'){ //Power-up map synchronization handling
			GeneratePowerUps(payload.substring(1));
		}

		//--------------------------------------------------------------------------------
		else if(payload[0] == '!'){ //Adding power up for a player
			var message = payload.substring(2);
			var pid = parseInt(payload[1]);
			var power_up_position = message.split(",");

			//Update player position (safe check)
			player[pid].x = parseInt(power_up_position[0]);
			player[pid].y = parseInt(power_up_position[1]);

			//Add powerup to player and update level
			var board_x = bitmap_position(parseInt(power_up_position[0]) + player[pid].sprite_width/2);
            var board_y = bitmap_position(parseInt(power_up_position[1]) + player[pid].sprite_height/2);
            board.board_powerups[board_y][board_x] = 0;
            player[pid].add_power_up(parseInt(power_up_position[2]));
		}
		//--------------------------------------------------------------------------------
		else if(payload[0] == '|'){ //Player death update
			var message = payload.substring(2);
			var pid = parseInt(payload[1]);
			var death_position = message.split(",");

			//Update player position (safe check)
			player[pid].x = parseInt(death_position[0]);
			player[pid].y = parseInt(death_position[1]);

			//Kill this damn player
			player[pid].kill();
		}
		//--------------------------------------------------------------------------------
		else if(payload[0] == ';'){ // Empty State update
			var message = payload.substring(1);
			var update_state = message.split("|");
			for(var i = 0; i<update_state.length;i++){
				var position = update_state[i].split(",");
				board.level[parseInt(position[0])][parseInt(position[1])] = 0;
			}
		}
		else if(payload[0] == ':'){ // Solid State update
			var message = payload.substring(1);
			var update_state = message.split("|");
			for(var i = 0; i<update_state.length;i++){
				var position = update_state[i].split(",");
				board.level[parseInt(position[0])][parseInt(position[1])] = 1;
			}
		}

		else if(payload == "<PING>"){ // For ping estimating
			var d = new Date();
			receive_time = d.getTime();
		}

		else
			log(payload);
	});
	
	Server.connect();
}

function EverySecond(){
    if(initialized){
    	var d = new Date();
    	send_time = d.getTime();
    	send("<PING>");
    	initialized = false;
    }
    if(document.getElementById("session_canvas")!=null)
    	draw_SessionCanvas();
    else if(document.getElementById("lobby_canvas")!=null){
		draw_LobbyCanvas();
    }
    setTimeout(EverySecond, 1000);//Every 1 secs
}
EverySecond();

function CheckConnection(){
	if(connected){
		ping = receive_time - send_time;
		var d = new Date();
    	send_time = d.getTime();
    	send("<PING>");
	}
	// if(typeof(StartStopBool)!="undefined"&&player[playerid].host == 1)
	// 	SendGameState();
	setTimeout(CheckConnection, 3000);//Every 3 secs
}
CheckConnection();

function SendGameState(){
	if(typeof(StartStopBool)!="undefined"){
		var empty_state = ";";
		var solid_state = ":";
		for (var i = 0; i < board.height; i++){
	        for (var j = 0; j < board.width; j++){
	        	if(board.level[i][j] == 0){
	        		empty_state+= i+","+j+"|";
	        	}
	        	else if(board.level[i][j] == 1){
	        		solid_state+= i+","+j+"|";
	        	}
			}
		}
		empty_state = empty_state.substring(0,empty_state.length-1);
		solid_state = solid_state.substring(0,solid_state.length-1);
		send(empty_state);
		send(solid_state);
	}
}













