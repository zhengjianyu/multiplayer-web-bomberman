#pragma once
#include <string>
#include <vector>
#include <iostream>
#include <sstream>
#include<algorithm>
#include<math.h>
#include "websocket.h"
#include <fstream>  
#include <chrono>
#include <thread>
#include "sha256.h"

struct Player {
	int clientID;
	string username;
	int ready;
	int host;
	int playerid;
};

class Session {
public:
	int waiting;
	int running;
	int current_players;
	string room_name;
	string room_password;
	vector<Player> players;
	Session(string room_name);
	~Session();

	void AddPlayerToSession(int clientID, string username);
	void RemovePlayerFromSession(int clientID);
	string GetSessionInfo();
	string GetPlayerInfo();
	int GetPlayerid(int clientID);
	string GetPlayerName(int clientID);

	void ChooseNewHost(int clientID);
	void InitLeftPlayerInfo(int clientID);
	
	
	int PlayersSize();
	bool CheckHostByClientID(int clientID);
	int FindPlayerIndexByClientID(int clientID);
	void Init();
};