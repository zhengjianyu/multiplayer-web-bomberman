#include "handler.h"
#include <stdlib.h>
#include <time.h>

vector<Session> Handler::sessions;
vector<string> Handler::login_list;
int Handler::maxPlayerSize = 99;
int Handler::maxSessionSize = 9;
vector<Userdata> Handler::Database;
vector<LeaderBoard> Handler::Leaderboard;

void Handler::PreInitServer(){
	srand(time(NULL));
	_read_database();
	_read_leaderboard();
	for (int i = 0; i < maxSessionSize; i++) {
		sessions.push_back(Session(""));
	}
	for (int i = 0; i < maxPlayerSize; i++) {
		login_list.push_back("");
	}
}

void Handler::InitSessions() {
	for (int i = 0; i < maxSessionSize; i++) {
		sessions[i].Init();
	}
}

int Handler::getMaxPlayerSize() {
	return maxPlayerSize;
}

void Handler::registerAcc(webSocket server, int clientID, string message) {
	Userdata userdata = _decrypt_userdata(message);
	vector<int> clientIDs = server.getClientIDs();
	if (!_check_duplicated_usernames(userdata.username))
		server.wsSend(clientID, "^!");
	else {
		_add_to_database(userdata);
		_add_to_leaderboard({ userdata.username, 0, 0, 0 });
		_sort_leaderboard();
		server.wsSend(clientID, "^+");
		_write_database();
		_write_leaderboard();
		if (clientIDs.size() > getMaxPlayerSize())
			return;
	}
	server.wsClose(clientID);
}

void Handler::sendLeaderboard(webSocket server, int clientID, int rank) {
	if (rank > Leaderboard.size())
		return;
	string lb_info = "_";
	int s_index = rank - 1;
	int e_index;
	if (s_index + 19 > Leaderboard.size() - 1)
		e_index = Leaderboard.size() - 1;
	else
		e_index = s_index + 19;
	for (int i = s_index; i <= e_index; i++) {
		lb_info += to_string(i+1)+","+Leaderboard[i].username + "," + to_string(Leaderboard[i].win) + "," + to_string(Leaderboard[i].lose) + "," + to_string(Leaderboard[i].win_rate);
		if (i < e_index)
			lb_info += "|";
	}
	server.wsSend(clientID, lb_info);
}

bool Handler::runSecurityCheck(webSocket server, int clientID, Userdata userdata) {
	bool check = false;
	switch(_security_check(server,userdata)) {
	case UNREGISTER_USERNAME_WARNING:
		server.wsSend(clientID, ">N");
		server.wsClose(clientID);
		break;
	case INCORRECT_PASSWORD_WARNING:
		server.wsSend(clientID, ">P");
		server.wsClose(clientID);
		break;
	case MULTIPLE_LOGIN_WARNING:
		server.wsSend(clientID, ">M");
		server.wsClose(clientID);
		break;
	case SERVER_FULL_WARNING:
		server.wsSend(clientID, ">-");
		server.wsClose(clientID);
		break;
	case PASS_SECURITY_CHECK:
		check = true;
		break;
	}
	return check;
}

void Handler::GrantSessionEntrance(webSocket server, int clientID, Userdata userdata) {
	login_list[clientID] = userdata.username;
	server.wsSend(clientID,">+");
	_sendSessionInfo(server);
}

void Handler::AddSession(webSocket server, int clientID,string message) {
	int column_index = message.find("|");
	int comma_index = message.find(",");
	string username = message.substr(1, column_index-1);
	string room_name = message.substr(column_index + 1, comma_index - column_index - 1);
	string room_password = message.substr(comma_index+1);
	for (int i = 0; i < maxSessionSize; i++) {
		if (sessions[i].room_name == "") {//find first available session space
			sessions[i].room_name = room_name;
			sessions[i].room_password = room_password;
			sessions[i].waiting = 1;
			sessions[i].AddPlayerToSession(clientID,username);
			int playerid = sessions[i].GetPlayerid(clientID);
			_grantLobbyEntrance(server, clientID, playerid);
			_sendPlayersInfo(server, i);
			break;
		}
	}
	_sendSessionInfo(server);
}

void Handler::JoinSession(webSocket server, int clientID, string message) {
	int comma_index = message.find(",");
	string username = message.substr(1, comma_index - 1);
	int room_id = stoi(message.substr(comma_index + 1));
	if (sessions[room_id].room_password == "") {
		sessions[room_id].AddPlayerToSession(clientID, username);
		int playerid = sessions[room_id].GetPlayerid(clientID);
		_grantLobbyEntrance(server, clientID, playerid);
		_sendPlayersInfo(server, room_id);
		_sendSessionInfo(server);
	}
	else {
		server.wsSend(clientID,"]P"+to_string(room_id));
	}
}

void Handler::JoinInvitedSession(webSocket server, int clientID, string message) {
	int comma_index = message.find(",");
	string username = message.substr(2, comma_index - 2);
	int room_id = stoi(message.substr(comma_index + 1));
	if (sessions[room_id].PlayersSize() < 4 && sessions[room_id].room_name!="") {
		sessions[room_id].AddPlayerToSession(clientID, username);
		int playerid = sessions[room_id].GetPlayerid(clientID);
		_grantLobbyEntrance(server, clientID, playerid);
		_sendPlayersInfo(server, room_id);
		_sendSessionInfo(server);
	}
	else {
		server.wsSend(clientID, "$#");
	}
}

void Handler::DenyInvitedSession(webSocket server, int clientID, string message) {
	int session_id = int(message[2]) - int('0');
	server.wsSend(FindHostClientID(session_id), "$-");
}

void Handler::VerifyRoomPassword(webSocket server, int clientID, string message) {
	int room_id = int(message[2]) - int('0');
	int comma_index = message.find(",");
	string username = message.substr(3,comma_index-3);
	string room_password = message.substr(comma_index+1);
	if (sessions[room_id].room_password == room_password) {
		sessions[room_id].AddPlayerToSession(clientID, username);
		int playerid = sessions[room_id].GetPlayerid(clientID);
		_grantLobbyEntrance(server, clientID, playerid);
		_sendPlayersInfo(server, room_id);
		_sendSessionInfo(server);
	}
	else {
		server.wsSend(clientID, "]-");
	}
}

int Handler::GetSessionid(int clientID) {
	for (int i = 0; i < maxSessionSize; i++) {
		for (int j = 0; j < 4; j++) {
			if (sessions[i].players[j].clientID == clientID)
				return i;
		}
	}
}

string Handler::GetPlayerName(int clientID, int session_id) {
	for (int i = 0; i < 4; i++)
		if (sessions[session_id].players[i].clientID == clientID)
			return sessions[session_id].players[i].username;
}

void Handler::InviteHandler(webSocket server, int clientID, string message) {
	string username = message.substr(1);
	int inv_clientID = GetClientIDByName(username);
	if (inv_clientID == -1)//User is not login
		server.wsSend(clientID, "$<");
	else if (PlayerInSession(inv_clientID))//User is already in session
		server.wsSend(clientID, "$>");
	else {
		int session_id = GetSessionid(clientID);
		string host_name = GetPlayerName(clientID, session_id);
		server.wsSend(inv_clientID, "$." + host_name + "," + to_string(session_id));
	}
		
}

bool Handler::PlayerInSession(int clientID) {
	for (int i = 0; i < maxSessionSize; i++) {
		for (int j = 0; j < 4; j++) {
			if (sessions[i].players[j].clientID == clientID)
				return true;
		}
	}
	return false;
}

int Handler::GetClientIDByName(string username) {
	for (int i = 0; i < login_list.size(); i++) {
		if (login_list[i] == username)
			return i;
	}
	return -1;
}

int Handler::FindHostClientID(int session_id) {
	for (int i = 0; i < 4; i++)
		if (sessions[session_id].players[i].host == 1)
			return sessions[session_id].players[i].clientID;
}

void Handler::removePlayer(webSocket server,int clientID) {
	int session_id = GetSessionid(clientID);
	sessions[session_id].RemovePlayerFromSession(clientID);
	_sendPlayersInfo(server, session_id);
	_sendSessionInfo(server);
	if (_checkReadyGame(session_id)) {
		_grantStartGame(server, session_id);
	}
}

void Handler::readyPlayer(webSocket server, int clientID) {//Player ready handling
	int session_id = GetSessionid(clientID);
	for (int i = 0; i < 4; i++) {
		if (sessions[session_id].players[i].clientID == clientID)
			sessions[session_id].players[i].ready = 1;
	}
	_sendPlayersInfo(server,session_id);
	if (_checkReadyGame(session_id)) {
		_grantStartGame(server,session_id);
	}
}

void Handler::runGame(webSocket server,int session_id) {//Signal all active clients to start game
	for (int i = 0; i < 4; i++)
		if (sessions[session_id].players[i].username!="")
			server.wsSend(sessions[session_id].players[i].clientID, "~S");
	sessions[session_id].running = 1;
	sessions[session_id].waiting = 0;
	_sendSessionInfo(server);
}

void Handler::endGame(webSocket server, int session_id, int clientID) {  //turning signal back to non-active
	for (int i = 0; i < 4; i++) {
		if (sessions[session_id].players[i].host != 1)
			sessions[session_id].players[i].ready = 0;
	}
	sessions[session_id].running = 0;
	sessions[session_id].waiting = 1;
	_sendPlayersInfo(server, session_id);
	_sendSessionInfo(server);
}

void Handler::updateWin(int session_id, int clientID) {
	string win_user = sessions[session_id].GetPlayerName(clientID);
	for (int i = 0; i < Leaderboard.size(); i++) {
		if (Leaderboard[i].username == win_user) {
			Leaderboard[i].win++;
			Leaderboard[i].win_rate = int(Leaderboard[i].win / double(Leaderboard[i].win + Leaderboard[i].lose) * 100);
		}
	}
	_sort_leaderboard();
	_write_leaderboard();
}

void Handler::updateLose(int session_id, int clientID) {
	string win_user = sessions[session_id].GetPlayerName(clientID);
	for (int i = 0; i < Leaderboard.size(); i++) {
		if (Leaderboard[i].username == win_user) {
			Leaderboard[i].lose++;
			Leaderboard[i].win_rate = int(Leaderboard[i].win / double(Leaderboard[i].win+Leaderboard[i].lose) * 100);
		}
	}
	_sort_leaderboard();
	_write_leaderboard();
}

void Handler::updateGameState(webSocket server, int session_id, int clientID, string message) {
	for (int i = 0; i < 4; i++)
		if (sessions[session_id].players[i].username != "" && sessions[session_id].players[i].clientID != clientID)
			server.wsSend(sessions[session_id].players[i].clientID, message);
}


void Handler::directionHandle(webSocket server, int clientID, string message, int session_id) {
	int playerid = sessions[session_id].GetPlayerid(clientID);
	string newmessage = "-" + to_string(playerid) + message.substr(1);
	for (int i = 0; i < 4; i++)
		if (sessions[session_id].players[i].username != "" && sessions[session_id].players[i].clientID!=clientID)
			server.wsSend(sessions[session_id].players[i].clientID, newmessage);
}

void Handler::positionHandler(webSocket server, int clientID, string message,int session_id){
	int playerid = sessions[session_id].GetPlayerid(clientID);
	string newmessage = "&" + to_string(playerid) + message.substr(1);
	for (int i = 0; i < 4; i++)
		if (sessions[session_id].players[i].username != "" && sessions[session_id].players[i].clientID != clientID)
			server.wsSend(sessions[session_id].players[i].clientID, newmessage);
}

void Handler::bombHandler(webSocket server, int clientID, string message, int session_id) {
	int playerid = sessions[session_id].GetPlayerid(clientID);

	string pos_message = "*" + to_string(playerid) + message.substr(1);
	for (int i = 0; i < 4; i++)
		if (sessions[session_id].players[i].username != "")
			server.wsSend(sessions[session_id].players[i].clientID, pos_message);
}

void Handler::powerupMapHandler(webSocket server, int clientID, string message, int session_id) {
	for (int i = 0; i < 4; i++)
		if (sessions[session_id].players[i].username != "" && sessions[session_id].players[i].clientID != clientID)
			server.wsSend(sessions[session_id].players[i].clientID, message);
}

void Handler::addPowerUpHandler(webSocket server, int clientID, string message, int session_id) {
	for (int i = 0; i < 4;i++)
		if (sessions[session_id].players[i].username != "" && sessions[session_id].players[i].clientID != clientID)
			server.wsSend(sessions[session_id].players[i].clientID, message);
}

void Handler::deathHandler(webSocket server, int clientID, string message, int session_id) {
	for (int i = 0; i < 4; i++)
		if (sessions[session_id].players[i].username != "" && sessions[session_id].players[i].clientID != clientID)
			server.wsSend(sessions[session_id].players[i].clientID, message);
}

//-------------Message handling
void Handler::serveMessage(webSocket server, int clientID, string message) {
	vector<int> clientIDs = server.getClientIDs();

	if (message[0] == '^') {//Registering users
		registerAcc(server, clientID,message.substr(1));
	}
	else if (message[0] == '>') {//Player request entering session scene
		Userdata userdata = _decrypt_userdata(message.substr(1));
		if (runSecurityCheck(server, clientID, userdata))
			GrantSessionEntrance(server, clientID,userdata);
	}
	else if (message[0] == '[') {//Player request create room
		if (_checkAvailableSession())
			AddSession(server, clientID, message);
		else
			server.wsSend(clientID, ">-");
	}
	else if (message[0] == ']') {//Player request join room
		if (message[1] == ']')
			VerifyRoomPassword(server, clientID, message);
		else
			JoinSession(server, clientID, message);
	}
	else if (message[0] == '$') {//Host inviting player
		if (message[1] == '+')//Accept invite
			JoinInvitedSession(server, clientID, message);
		else if (message[1] == '-') //Denney invite
			DenyInvitedSession(server, clientID, message);
		else
			InviteHandler(server, clientID, message);
	}
	else if (message[0] == '@') {//Returning to session from lobby
		removePlayer(server, clientID);
	}
	else if (message[0] == '`') {//Preparing game
		if (message[1] == 'R') {
			readyPlayer(server, clientID);
		}
		else if (message[1] == 'S') {//Client->server: for starting the game
			int session_id = GetSessionid(clientID);
			runGame(server,session_id);
		}
		else if (message[1] == 'E') {//End game handling
			int session_id = GetSessionid(clientID);
			endGame(server, session_id, clientID);
			if (message[2] == '+')
				updateWin(session_id, clientID);
			else if (message[2] == '-')
				updateLose(session_id, clientID);
		}
	}
	else if (message[0] == '-') {  //player direction
		int session_id = GetSessionid(clientID);
		directionHandle(server, clientID, message,session_id);
	}
	else if (message[0] == '&') {   //Position handling
		int session_id = GetSessionid(clientID);
		positionHandler(server, clientID, message,session_id);
	} 
	else if (message[0] == '*'){  //Bomb handling
		int session_id = GetSessionid(clientID);
		bombHandler(server, clientID, message,session_id);
	}
	else if (message[0] == '/') { //Power-up handling
		int session_id = GetSessionid(clientID);
		powerupMapHandler(server, clientID, message,session_id);
	}
	else if (message[0] == '!') { //Handling powerup update
		int session_id = GetSessionid(clientID);
		addPowerUpHandler(server, clientID, message, session_id);
	}
	else if (message[0] == '|') { //Handling player death update
		int session_id = GetSessionid(clientID);
		deathHandler(server, clientID, message, session_id);
	}
	else if (message[0] == ';' || message[0] == ':') { //Handling level update
		int session_id = GetSessionid(clientID);
		updateGameState(server, session_id, clientID, message);
	}
	else if (message[0] == '_') { //Leaderboard Handling
		if (message[1] == 'b') { // Returning to intro
			server.wsClose(clientID);
		}
		else {//Requesting Leaderboard info
			sendLeaderboard(server, clientID, stoi(message.substr(1)));
		}
	}
	else if (message == "<REQUESTINFO>") { //Client Requesting playerinfo/session info
		int session_id = GetSessionid(clientID);
		_sendPlayersInfo(server, session_id);
		_sendSessionInfo(server);
		if (_checkReadyGame(session_id)) {
			_grantStartGame(server, session_id);
		}
	}
	else if (message == "<PING>") { // For estimating ping only
		server.wsSend(clientID,"<PING>");
	}
	else {
		int session_id = GetSessionid(clientID);
		for (int i = 0; i < 4; i++) {
			if (sessions[session_id].players[i].clientID!=clientID && sessions[session_id].players[i].username!="")
				server.wsSend(clientIDs[i], GetPlayerName(clientID,session_id)+": " + message);
		}
	}
}

void Handler::_grantLobbyEntrance(webSocket server, int clientID,int playerid) {
	server.wsSend(clientID, "@+" + to_string(playerid));//Grant lobby entrance
}

void Handler::_sendPlayersInfo(webSocket server,int sessionID) {
	for (int i = 0; i < 4; i++) {
		if (sessions[sessionID].players[i].username != "") {
			server.wsSend(sessions[sessionID].players[i].clientID, sessions[sessionID].GetPlayerInfo());
		}
	}
}

int Handler::_security_check(webSocket server,Userdata userdata) {//Security door of login
	vector<int> clientIDs = server.getClientIDs();
	if (_find_user_password(userdata.username) == "")//User not registered
		return UNREGISTER_USERNAME_WARNING;
	else if (_find_user_password(userdata.username) != userdata.password)//Registered user's password not matching
		return INCORRECT_PASSWORD_WARNING;
	else if (_check_user_login(userdata.username))//The user is already login
		return MULTIPLE_LOGIN_WARNING;
	else if (clientIDs.size() > maxPlayerSize)
		return SERVER_FULL_WARNING;
	else
		return PASS_SECURITY_CHECK;
}

bool Handler::_checkReadyGame(int session_id) {
	int ready_check= 0;
	int playercount = 0;
	for (int i = 0; i < 4; i++) {
		if (sessions[session_id].players[i].username != "")
			playercount++;
	}
	for (int i = 0; i <4; i++)
		ready_check += sessions[session_id].players[i].ready;
	return ready_check == playercount && playercount != 1;
}

void Handler::_grantStartGame(webSocket server,int session_id) {//Tell the host the game is ready
	for (int i = 0; i < 4; i++) {
		if(sessions[session_id].players[i].host == 1)
			server.wsSend(sessions[session_id].players[i].clientID, "`");
	}
}

void Handler::_read_database() {
	ifstream inf("database.txt");
	string c = ",";
	string line;
	while (!inf.eof())
	{
		getline(inf, line);
		if (line.find(c) != std::string::npos) {//Check if the line has right formatted username/password
			Userdata result = { line.substr(0,line.find(c)),line.substr(line.find(c) + 1)};
			Database.push_back(result);
		}
	}
	inf.close();
}

void Handler::_read_leaderboard() {
	ifstream inf("leaderboard.txt");
	string s_username;
	string s_win;
	string s_lose;
	string s_win_rate;
	int n = 0;
	while (!inf.eof())
	{
		getline(inf, s_username, ',');
		if (s_username.length() > 0) {
			getline(inf, s_win, ',');
			getline(inf, s_lose, ',');
			getline(inf, s_win_rate);
			LeaderBoard lb = { s_username,stoi(s_win),stoi(s_lose),stoi(s_win_rate) };
			_add_to_leaderboard(lb);
		}
	}
	inf.close();
}

void Handler::_write_database() {
	ofstream outf("database.txt");
	for (auto i : Database) {
		outf << i.username << "," << i.password << endl;
	}
	outf.close();
}

void Handler::_write_leaderboard() {
	ofstream outf("leaderboard.txt");
	for (auto i : Leaderboard) {
		outf << i.username << "," << i.win<<","<<i.lose<<","<<i.win_rate << endl;
	}
	outf.close();
}

void Handler::_add_to_database(Userdata userdata) {
	Database.push_back(userdata);
}

void Handler::_add_to_leaderboard(LeaderBoard leaderboard) {
	Leaderboard.push_back(leaderboard);
}

void Handler::_sort_leaderboard() {
	sort(Leaderboard.begin(), Leaderboard.end(), _win_rate_less_than);
}

bool Handler::_win_rate_less_than(LeaderBoard l1, LeaderBoard l2) {
	return l2.win_rate < l1.win_rate;
}

bool Handler::_check_duplicated_usernames(string username) {
	for (auto x : Database) {
		if (username == x.username)
			return false;
	}
	return true;
}

string Handler::_find_user_password(string username) {//Find user's password, return empty string if user is not found
	string password = "";
	for (auto x : Database)
		if (username == x.username)
			password = x.password;
	return password;
}

Userdata Handler::_decrypt_userdata(string message){
	string c = ",";
	int sep = message.find(",");
	string username = message.substr(0, sep);
	string password = sha256(message.substr(sep + 1));
	return Userdata{username,password };
}

bool Handler::_check_user_login(string username) {
	for (int i = 0; i < login_list.size(); i++) {
		if (username == login_list[i])
				return true;
	}
	return false;
}

void Handler::_sendSessionInfo(webSocket server) {
	string AllSessionInfo = ">U";
	for (int i = 0; i < maxSessionSize; i++) {
		AllSessionInfo += sessions[i].GetSessionInfo();
		if (i != maxSessionSize - 1)
			AllSessionInfo += "|";
	}
	vector<int> clientIDs = server.getClientIDs();
	for (int i = 0; i < clientIDs.size();i++)
		server.wsSend(clientIDs[i], AllSessionInfo);
}

bool Handler::_checkAvailableSession() {
	int check = 0;
	for (int i = 0; i < maxSessionSize; i++)
		if (sessions[i].room_name != "")
			check++;
	return check < maxSessionSize;
}

