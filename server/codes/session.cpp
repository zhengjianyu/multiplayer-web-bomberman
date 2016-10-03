#include "session.h"

Session::Session(string room_name) {
	this->room_name = room_name;
	this->room_password = "";
	this->waiting = 0;
	this->running = 0;
	players.push_back({ 999, "", 1,1,0 });
	players.push_back({ 999, "", 0,0,1 });
	players.push_back({ 999, "", 0,0,2 });
	players.push_back({ 999, "", 0,0,3 });	
}

Session::~Session() {
	
}

void Session::AddPlayerToSession(int clientID,string username) {
	for (int i = 0; i < 4; i++) {//Find first available spot
		if (players[i].username == "") {
			players[i].clientID = clientID;
			players[i].username = username;
			players[i].playerid = i;
			return;
		}
	}
}

void Session::RemovePlayerFromSession(int clientID) {
	ChooseNewHost(clientID);
	InitLeftPlayerInfo(clientID);
}

string Session::GetSessionInfo() {
	return room_name + "," + to_string(PlayersSize()) + "," + to_string(waiting) + "," + to_string(running) + ","+room_password;
}

string Session::GetPlayerInfo() {
	string playersInfo = "@U|";
	for (int i = 0; i < 4; i++) {
		playersInfo += to_string(players[i].playerid) + "," + players[i].username + "," + to_string(players[i].ready) + "," + to_string(players[i].host);
		if (i != 4 - 1)
			playersInfo += "|";
	}
	return playersInfo;
}

int Session::GetPlayerid(int clientID) {
	for (int i = 0; i < 4; i++) {
		//cout << "ClientID: "<<players[i].clientID << endl;
		if (clientID == players[i].clientID) 
			return players[i].playerid;
	}
}

string Session::GetPlayerName(int clientID) {
	for (int i = 0; i < 4; i++) {
		if (clientID == players[i].clientID)
			return players[i].username;
	}
}

void Session::ChooseNewHost(int clientID) {
	vector<int> randList;
	if (CheckHostByClientID(clientID) && PlayersSize()>1) {
		for (int i = 0; i < 4; i++) {
			if (!CheckHostByClientID(players[i].clientID) && players[i].username != "")
				randList.push_back(players[i].playerid);
		}
		int hostIndex = rand() % randList.size();
		players[randList[hostIndex]].host = 1;
	}
}

void Session::InitLeftPlayerInfo(int clientID) {
	if (PlayersSize() <= 1) {//Last player left
		Init();
		return;
	}
	int index = FindPlayerIndexByClientID(clientID);
	players[index].username = "";
	players[index].host = 0;
	players[index].ready = 0;
	players[index].clientID = 999;
}
int Session::PlayersSize() {
	int n = 0;
	for (int i = 0; i < 4; i++)
		if (players[i].username != "")
			n++;
	return n;
}

bool Session::CheckHostByClientID(int clientID) {
	for (int i = 0; i < 4; i++) 
		if (players[i].clientID == clientID && players[i].host == 1)
			return true;
	return false;
}

int Session::FindPlayerIndexByClientID(int clientID) {
	for (int i = 0; i < 4; i++)
		if (players[i].clientID == clientID)
			return i;
}

void Session::Init() {
	this->room_name = "";
	this->room_password = "";
	this->waiting = 0;
	this->running = 0;
	players[0] = { 999, "", 1,1,0 };
	players[1] = { 999, "", 0,0,1 };
	players[2] = { 999, "", 0,0,2 };
	players[3] = { 999, "", 0,0,3 };
}
