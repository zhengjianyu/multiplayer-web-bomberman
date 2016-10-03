//board size
var board_size = "SMALL"; //SMALL

// Canvas
var context;
var WIDTH;
var HEIGHT;

// Board
var board;
var block_size = 40;

// Array of players
//var player = [];

// Sprites
var white_bomberman;
var black_bomberman;
var red_bomberman;
var blue_bomberman;
var bomb_sprite;
var explosion_sprite;

// Load sprites
white_bomberman = new Image();
black_bomberman = new Image();
red_bomberman = new Image();
blue_bomberman = new Image();
bomb_sprite = new Image();
explosion_sprite = new Image();
powerups_sprite = new Image();
lock_sprite = new Image();
winning_scene = new Image();

white_bomberman.src = 'assets/sprites/white_bomberman.gif';
black_bomberman.src = 'assets/sprites/black_bomberman.gif';
red_bomberman.src = 'assets/sprites/red_bomberman.gif';
blue_bomberman.src = 'assets/sprites/blue_bomberman.gif';
bomb_sprite.src = 'assets/sprites/bombs.gif';
explosion_sprite.src = 'assets/sprites/explosion.gif';
powerups_sprite.src = 'assets/sprites/power-ups.gif';
lock_sprite.src = 'assets/sprites/lock.png';
winning_scene.src = 'assets/sprites/winningScene.jpg';

var player = [];
var sessions = [];
var leaderboard = [];

function init_leaderboard(){
  for(var i = 0; i<20;i++){
    leaderboard[i].username = "";
  }
}

function PreInit(){//Set up scene and players' positions
	var StartStopBool;
	
	HideRegister();
  HideLeaderboard();
	HideSession();
	HideLobby();
	HideEnding();

	for(var i = 0; i<9;i++){
		sessions[i] = new Session("");
	}

  for(var i = 0; i<20;i++){
    leaderboard[i] = new Leaderboard("");
  }

	player[0] = new Player(white_bomberman, "", 0,0, block_size, block_size);
    player[1] = new Player(black_bomberman, "", 0,0, WIDTH-2*block_size, block_size);
    player[2] = new Player(red_bomberman, "", 0,0, block_size, HEIGHT-2*block_size);
    player[3] = new Player(blue_bomberman, "", 0,0, WIDTH-2*block_size, HEIGHT-2*block_size);
}

function draw_EndingCanvas(){
	var canvas = document.getElementById("endingCanvas");
	context = canvas.getContext("2d");
	context.drawImage(winning_scene,0,0,800,600);
	context.font = "30px Consolas";
	context.fillStyle = "cyan";
	context.fillText(get_winner(),140,50);
}


function get_winner(){
	for (var i = 0; i < 4; i ++){
		if (player[i].alive == 1){
			return "Winner is \"" + player[i].name + "\"";
		}
	}
	return "No winner";
}



function draw_SessionCanvas(){
	var canvas = document.getElementById("session_canvas");
  	context = canvas.getContext("2d");
  	context.font = "15px Consolas";

	// Get canvas dimensions
	WIDTH = canvas.width;
	HEIGHT = canvas.height;

	// Black borders (default)
	context.strokeStyle = "grey";
	context.lineWidth = 20;
	
	context.clearRect(0, 0, WIDTH, HEIGHT);
 
	// Fill background with pitch black
	context.fillStyle = "black";
	draw_block(0, 0, WIDTH, HEIGHT);

  context.textAlign="left";
  if(ping < 0){
    context.fillStyle = "orange";
    context.fillText("ping: estimating...",15,25);
  }
  else if(ping<=150){
    context.fillStyle = "SpringGreen";
    context.fillText("ping: "+ping+"ms",15,25);
  }
  else if(ping<=300){
    context.fillStyle = "yellow";
    context.fillText("ping: "+ping+"ms",15,25);
  }
  else{
    context.fillStyle = "red";
    context.fillText("ping: "+ping+"ms",15,25);
  }

	for(var i = 0; i<sessions.length; i++)
		draw_SessionInfo(sessions[i]);
}

function draw_SessionInfo(Session){
	context.textAlign="center";
	if(Session == sessions[0] && Session.room_name != ""){
  		context.drawImage(bomb_sprite,39,0,16,17,45,45,70,70);
  		context.fillStyle = "cyan";
  		context.font = "30px Consolas";
  		context.fillText("1",75,95);
  		context.fillStyle = "pink";
  		context.font = "15px Consolas";
  		context.fillText(Session.room_name,75,55);
  		if(Session.waiting == true){
  			context.font = "15px Consolas";
  			context.fillStyle = "yellow";
  			context.fillText(Session.current_players.toString()+"/4",75,120);
  			context.fillText("Waiting...",75,135);
  		}
  		else if(Session.running == true){
  			context.font = "15px Consolas";
  			context.fillStyle = "orange";
  			context.fillText(Session.current_players+"/4",75,120);
  			context.fillText("Running...",75,135);
  		}
  		if(Session.room_password!="")
  			context.drawImage(lock_sprite,0,0,100,100,80,85,30,30);
	}
  	else if(Session == sessions[1]&& Session.room_name != ""){
  		context.drawImage(bomb_sprite,39,0,16,17,165,45,70,70);
  		context.fillStyle = "cyan";
  		context.font = "30px Consolas";
  		context.fillText("2",195,95);
  		context.fillStyle = "pink";
  		context.font = "15px Consolas";
  		context.fillText(Session.room_name,195,55);
  		if(Session.waiting == true){
  			context.font = "15px Consolas";
  			context.fillStyle = "yellow";
  			context.fillText(Session.current_players+"/4",195,120);
  			context.fillText("Waiting...",195,135);
  		}
  		else if(Session.running == true){
  			context.font = "15px Consolas";
  			context.fillStyle = "orange";
  			context.fillText(Session.current_players+"/4",195,120);
  			context.fillText("Running...",195,135);
  		}
  		if(Session.room_password!="")
  			context.drawImage(lock_sprite,0,0,100,100,200,85,30,30);
  	}
  	else if(Session == sessions[2]&& Session.room_name != ""){
  		context.drawImage(bomb_sprite,39,0,16,17,285,45,70,70);
  		context.fillStyle = "cyan";
  		context.font = "30px Consolas";
  		context.fillText("3",315,95);
  		context.fillStyle = "pink";
  		context.font = "15px Consolas";
  		context.fillText(Session.room_name,315,55);
  		if(Session.waiting == true){
  			context.font = "15px Consolas";
  			context.fillStyle = "yellow";
  			context.fillText(Session.current_players+"/4",315,120);
  			context.fillText("Waiting...",315,135);
  		}
  		else if(Session.running == true){
  			context.font = "15px Consolas";
  			context.fillStyle = "orange";
  			context.fillText(Session.current_players+"/4",315,120);
  			context.fillText("Running...",315,135);
  		}
  		if(Session.room_password!="")
  			context.drawImage(lock_sprite,0,0,100,100,320,85,30,30);
  	}
  	else if(Session == sessions[3]&& Session.room_name != ""){
  		context.drawImage(bomb_sprite,39,0,16,17,45,165,70,70);
  		context.fillStyle = "cyan";
  		context.font = "30px Consolas";
  		context.fillText("4",75,215);
  		context.fillStyle = "pink";
  		context.font = "15px Consolas";
  		context.fillText(Session.room_name,75,175);
  		if(Session.waiting == true){
  			context.font = "15px Consolas";
  			context.fillStyle = "yellow";
  			context.fillText(Session.current_players+"/4",75,240);
  			context.fillText("Waiting...",75,255);
  		}
  		else if(Session.running == true){
  			context.font = "15px Consolas";
  			context.fillStyle = "orange";
  			context.fillText(Session.current_players+"/4",75,240);
  			context.fillText("Running...",75,255);
  		}
  		if(Session.room_password!="")
  			context.drawImage(lock_sprite,0,0,100,100,80,205,30,30);
  	}
  	else if(Session == sessions[4]&& Session.room_name != ""){
  		context.drawImage(bomb_sprite,39,0,16,17,165,165,70,70);
  		context.fillStyle = "cyan";
  		context.font = "30px Consolas";
  		context.fillText("5",195,215);
  		context.fillStyle = "pink";
  		context.font = "15px Consolas";
  		context.fillText(Session.room_name,195,175);
  		if(Session.waiting == true){
  			context.font = "15px Consolas";
  			context.fillStyle = "yellow";
  			context.fillText(Session.current_players+"/4",195,240);
  			context.fillText("Waiting...",195,255);
  		}
  		else if(Session.running == true){
  			context.font = "15px Consolas";
  			context.fillStyle = "orange";
  			context.fillText(Session.current_players+"/4",195,240);
  			context.fillText("Running...",195,255);
  		}
  		if(Session.room_password!="")
  			context.drawImage(lock_sprite,0,0,100,100,200,205,30,30);
  	}
  	else if(Session == sessions[5]&& Session.room_name != ""){
  		context.drawImage(bomb_sprite,39,0,16,17,285,165,70,70);
  		context.fillStyle = "cyan";
  		context.font = "30px Consolas";
  		context.fillText("6",315,215);
  		context.fillStyle = "pink";
  		context.font = "15px Consolas";
  		context.fillText(Session.room_name,315,175);
  		if(Session.waiting == true){
  			context.font = "15px Consolas";
  			context.fillStyle = "yellow";
  			context.fillText(Session.current_players+"/4",315,240);
  			context.fillText("Waiting...",315,255);
  		}
  		else if(Session.running == true){
  			context.font = "15px Consolas";
  			context.fillStyle = "orange";
  			context.fillText(Session.current_players+"/4",315,240);
  			context.fillText("Running...",315,255);
  		}
  		if(Session.room_password!="")
  			context.drawImage(lock_sprite,0,0,100,100,320,205,30,30);
  	}
  	else if(Session == sessions[6]&& Session.room_name != ""){
  		context.drawImage(bomb_sprite,39,0,16,17,45,285,70,70);
  		context.fillStyle = "cyan";
  		context.font = "30px Consolas";
  		context.fillText("7",75,335);
  		context.fillStyle = "pink";
  		context.font = "15px Consolas";
  		context.fillText(Session.room_name,75,295);
  		if(Session.waiting == true){
  			context.font = "15px Consolas";
  			context.fillStyle = "yellow";
  			context.fillText(Session.current_players+"/4",75,360);
  			context.fillText("Waiting...",75,375);
  		}
  		else if(Session.running == true){
  			context.font = "15px Consolas";
  			context.fillStyle = "orange";
  			context.fillText(Session.current_players+"/4",75,360);
  			context.fillText("Running...",75,375);
  		}
  		if(Session.room_password!="")
  			context.drawImage(lock_sprite,0,0,100,100,80,320,30,30);
  	}
  	else if(Session == sessions[7]&& Session.room_name != ""){
  		context.drawImage(bomb_sprite,39,0,16,17,165,285,70,70);
  		context.fillStyle = "cyan";
  		context.font = "30px Consolas";
  		context.fillText("8",195,335);
  		context.fillStyle = "pink";
  		context.font = "15px Consolas";
  		context.fillText(Session.room_name,195,295);
  		if(Session.waiting == true){
  			context.font = "15px Consolas";
  			context.fillStyle = "yellow";
  			context.fillText(Session.current_players+"/4",195,360);
  			context.fillText("Waiting...",195,375);
  		}
  		else if(Session.running == true){
  			context.font = "15px Consolas";
  			context.fillStyle = "orange";
  			context.fillText(Session.current_players+"/4",195,360);
  			context.fillText("Running...",195,375);
  		}
  		if(Session.room_password!="")
  			context.drawImage(lock_sprite,0,0,100,100,200,320,30,30);
  	}
  	else if(Session == sessions[8]&& Session.room_name != ""){
  		context.drawImage(bomb_sprite,39,0,16,17,285,285,70,70);
  		context.fillStyle = "cyan";
  		context.font = "30px Consolas";
  		context.fillText("9",315,335);
  		context.fillStyle = "pink";
  		context.font = "15px Consolas";
  		context.fillText(Session.room_name,315,295);
  		if(Session.waiting == true){
  			context.font = "15px Consolas";
  			context.fillStyle = "yellow";
  			context.fillText(Session.current_players+"/4",315,360);
  			context.fillText("Waiting...",315,375);
  		}
  		else if(Session.running == true){
  			context.font = "15px Consolas";
  			context.fillStyle = "orange";
  			context.fillText(Session.current_players+"/4",315,360);
  			context.fillText("Running...",315,375);
  		}
  		if(Session.room_password!="")
  			context.drawImage(lock_sprite,0,0,100,100,320,320,30,30);
  	}
 }


function draw_PlayerInfo(Player){
	context.textAlign="center";
	if(Player == player[0] && player[0].name!=""){
		context.drawImage(Player.sprite_sheet,0,0,15,20,20,40,60,60);
		context.fillStyle = "white";
		context.fillText(Player.name,50,120);
		if(Player.host == 1){
			context.fillStyle = "orange";
			context.fillText("HOST",50,30);
		}
		else if(Player.ready ==1){
			context.fillStyle = "yellow";
			context.fillText("READY",50,30);
		}
	}
	else if(Player == player[1] && player[1].name!=""){
		context.drawImage(Player.sprite_sheet,0,0,15,20,120,40,60,60);
		context.fillStyle = "grey";
		context.fillText(Player.name,150,120);
		if(Player.host == 1){
			context.fillStyle = "orange";
			context.fillText("HOST",150,30);
		}
		else if(Player.ready == 1){
			context.fillStyle = "yellow";
			context.fillText("READY",150,30);
		}
	}
	else if(Player == player[2] && player[2].name!=""){
		context.drawImage(Player.sprite_sheet,0,0,15,20,220,40,60,60);
		context.fillStyle = "red";
		context.fillText(Player.name,250,120);
		if(Player.host == 1){
			context.fillStyle = "orange";
			context.fillText("HOST",250,30);
		}
		else if(Player.ready == 1){
			context.fillStyle = "yellow";
			context.fillText("READY",250,30);
		}
	}
	else if(Player == player[3] && player[3].name!=""){
		context.drawImage(Player.sprite_sheet,0,0,15,20,320,40,60,60);
		context.fillStyle = "blue";
		context.fillText(Player.name,350,120);
		if(Player.host == 1){
			context.fillStyle = "orange";
			context.fillText("HOST",350,30);
		}
		else if(Player.ready == 1){
			context.fillStyle = "yellow";
			context.fillText("READY",350,30);
		}
	} 
}

function draw_LeaderboardCanvas(){
  var canvas = document.getElementById("leaderboard_canvas");
  context = canvas.getContext("2d");
  context.font = "15px Consolas";

  // Get canvas dimensions
  WIDTH = canvas.width;
  HEIGHT = canvas.height;

  // Black borders (default)
  context.strokeStyle = "purple";
  context.lineWidth = 5;
  
  context.clearRect(0, 0, WIDTH, HEIGHT);
 
  // Fill background with pitch black
  context.fillStyle = "rgba(0, 0, 0, 1)";
  draw_block(0, 0, WIDTH, HEIGHT);

  draw_LeaderboardInfo();
}

function draw_LeaderboardInfo(){
  var y = 40;
  context.fillStyle = "orange";
  context.fillText("Rank",10,20);
  context.fillText("Name",90,20);
  context.fillText("Win",170,20);
  context.fillText("Lose",250,20);
  context.fillText("Win Rate",330,20);
  for(var i = 0; i<leaderboard.length;i++){
    if(leaderboard[i].username!=""){
      context.fillStyle = "yellow";
      context.fillText(leaderboard[i].rank,10,y);
      context.fillText(leaderboard[i].username,90,y);
      context.fillText(leaderboard[i].win,170,y);
      context.fillText(leaderboard[i].lose,250,y);
      context.fillText(leaderboard[i].win_rate+"%",350,y);
      y+=20;
    }
  }
}

function draw_LobbyCanvas(){
	var canvas = document.getElementById("lobby_canvas");
    context = canvas.getContext("2d");
    context.font = "15px Consolas";

	// Get canvas dimensions
	WIDTH = canvas.width;
	HEIGHT = canvas.height;

	// Black borders (default)
	context.strokeStyle = "cyan";
	context.lineWidth = 5;
	
	context.clearRect(0, 0, WIDTH, HEIGHT);
 
	// Fill background with pitch black
	context.fillStyle = "rgba(0, 0, 0, 1)";
	draw_block(0, 0, WIDTH, HEIGHT);

  context.textAlign="left";
  if(ping < 0){
    context.fillStyle = "orange";
    context.fillText("ping: estimating...",5,140);
  }
  else if(ping<=150){
    context.fillStyle = "SpringGreen";
    context.fillText("ping: "+ping+"ms",5,140);
  }
  else if(ping<=300){
    context.fillStyle = "yellow";
    context.fillText("ping: "+ping+"ms",5,140);
  }
  else{
    context.fillStyle = "red";
    context.fillText("ping: "+ping+"ms",5,140);
  }

	for(i = 0; i<player.length;i++)
		draw_PlayerInfo(player[i]);
}

function HideIntro(){
  document.getElementById('intro').innerHTML = "";
}

function ShowIntro(){
	document.getElementById('intro').innerHTML = introContent;
}

function HideRegister(){
	document.getElementById('register').innerHTML = "";
}

function ShowRegister(){
	document.getElementById('register').innerHTML = registerContent;
}

function ShowLeaderboard(){
  document.getElementById('leaderboard').innerHTML = leaderboardContent;
  draw_LeaderboardCanvas();
}

function HideLeaderboard(){
  document.getElementById('leaderboard').innerHTML ="";
}

function HideLobby(){
	document.getElementById('lobby').innerHTML = "";
}

function ShowLobby(){
	document.getElementById('lobby').innerHTML = lobbyContent;
	draw_LobbyCanvas();
	$('#message').keypress(function(e) {//Has to be after Lobby is shown
		if ( e.keyCode == 13 && this.value ) {
			log( 'You: ' + this.value );
			send( this.value );
			$(this).val('');
			}
	});
}

function ShowSession(){
	document.getElementById('session').innerHTML = sessionContent;
  document.getElementById('welcome_msg').innerHTML = "Welcome "+client_username+", please join or create a room.";
  document.getElementById('welcome_msg').style.color = "orange";
  document.getElementById('welcome_msg').style.font = "bold 30px arial,serif";
	draw_SessionCanvas();
}

function HideSession(){
	document.getElementById('session').innerHTML = "";
}

function ShowGame(){
	document.getElementById('game').innerHTML = gameContent;
	init();
	main();
}

function HideGame(){
	document.getElementById('game').innerHTML = "";
}

function ShowEnding(){
	win.play();
	document.getElementById('ending').innerHTML = endingContent;
	draw_EndingCanvas();
}

function HideEnding(){
	document.getElementById('ending').innerHTML = "";
}


function StartGame(){
	HideLobby();
	ShowGame();
}


function CheckGame(){//Start and Ready button handling
	document.getElementById("strbtn").disabled = true;
	if(document.getElementById("strbtn").textContent == "Start Game"){
		startsound.play();//sound added here
		InitGameBoard();
		SendPowerUps();
		send("`S");//Start Game request
	}
	else if(document.getElementById("strbtn").textContent == "Ready"){
		readysound.play();
		InitGameBoard();
		send("`R");//Tell server to update this player's state
	}
}

function end_back(){
	session_bgm.play();
	HideEnding();
	ShowLobby();
	send("<REQUESTINFO>");
}

function register(){
	HideIntro();
	ShowRegister();
}

function submit(){
	var regStatus = 0; //Three cases for close handler, 0: no connection, 1: has connection
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
	Server = new FancyWebSocket('ws://' + ip + ':' + port);

	Server.bind('open', function() {
		var username = document.getElementById('username').value;
		var password = document.getElementById('password').value;
		send("^"+username+","+password);
		
	});

	Server.bind('message', function( payload ) {
		if(payload[0] == '^'){//Registering handling
			if(payload[1]=='+'){//Registering sussessful
				log("Account Registered!");
				regStatus = 1;
			}
			else if(payload[1]=='!'){//Duplicated names)
				alert("Username has been taken, try another one.")
				regStatus = 1;
			}
		}
	});

	Server.bind('close', function( data ) {
		if(regStatus == 0)
			log("No connection to server.");
	});

	Server.connect();
}

function check_leader_board(){
  Server = new FancyWebSocket('ws://' + ip + ':' + port);
  Server.bind('open', function() {
      HideIntro();
      ShowLeaderboard();
    send("_1");
  });

  Server.bind('message', function( payload ) {
    if(payload[0] == "_"){//Displaying leader board
      var message = payload.substring(1);
      var lb = message.split("|");
      init_leaderboard();
      for(var i = 0; i<lb.length;i++){
        var lbinfo = lb[i].split(",");
        leaderboard[i].rank = lbinfo[0];
        leaderboard[i].username = lbinfo[1];
        leaderboard[i].win = lbinfo[2];
        leaderboard[i].lose = lbinfo[3];
        leaderboard[i].win_rate = lbinfo[4];
      }
      draw_LeaderboardCanvas();
    }
  });
  Server.bind('close', function( data ) {
    log("Disconnected.");
  });
  Server.connect();
}

function leaderboard_back(){
  send("_b");
  HideLeaderboard();
  ShowIntro();
}

function next_page(){
  if(leaderboard[19].username!=""){
    var rank = parseInt(leaderboard[19].rank)+1;
    send("_"+rank);
  }
}

function previous_page(){
  if(leaderboard[0].rank!=1){
    var rank = parseInt(leaderboard[0].rank)-20;
    send("_"+rank);
  }
}

function register_back(){
	HideRegister();
	ShowIntro();
}

function join_room(){
	if(typeof(sessions[document.getElementById('room_id').value-1]) == "undefined" || sessions[document.getElementById('room_id').value-1].room_name == ""){
		alert("The room is not found.");
		return;
	}
	else if(sessions[document.getElementById('room_id').value-1].running || sessions[document.getElementById('room_id').value-1].current_players ==4){
		alert("You can't enter this room.")
		return;
	}
	else if(sessions[document.getElementById('room_id').value-1].waiting){
		var room_id = document.getElementById('room_id').value-1;
		send("]"+client_username+"," +room_id);
		document.getElementById('room_id').value = "";
	}
}

function create_room(){
	if(document.getElementById('room_name').value==""){
		alert("Please give a name for the room!");
		return;
	}
	if(document.getElementById('room_name').value.search(",")!=-1 ||document.getElementById('room_password').value.search(",")!=-1 ){
		alert("No speical characters allowed in room name/password!");
		return;
	}
	send("["+client_username+"|"+document.getElementById('room_name').value+","+document.getElementById('room_password').value);
	document.getElementById('room_name').value = "";
	document.getElementById('room_password').value = "";
}

function lobby_back(){
	send("@");
	HideLobby();
	ShowSession();
}

function invite(){
	if(!SessionIsFull()){
		var playername = prompt("Enter player's name to invite.");
		if(playername!=null)
			send("$"+playername);
	}
	else{
		alert("This room is already full!");
	}
}

function SessionIsFull(){
	for(var i = 0; i<4;i++){
		if(player[i].name == "")
			return false;
	}
	return true;
}

function InviteConfirm(host_name,session_id){
	if(confirm(host_name+" invites you to join "+sessions[session_id].room_name)){
		send("$+"+client_username+","+session_id);//Confirm joining
	}else{
		send("$-"+session_id);//Deney joining
	}
}

function DisconnecitonAlert(){
  session_bgm.pause();
  session_bgm.currentTime = 0;
  HideRegister();
  HideSession();
  HideLobby();
  HideEnding();
  if(typeof(StartStopBool)!="undefined")
    window.cancelAnimationFrame(StartStopBool);
  bgm.pause();
  bgm.currentTime = 0;
  HideGame();
  ShowIntro();
  alert("No connection to server.");
}