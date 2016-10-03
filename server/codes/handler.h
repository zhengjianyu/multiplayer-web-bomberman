#pragma once
#include "session.h"

using namespace std;

//----------------Defining warnings for security check
#define INCORRECT_PASSWORD_WARNING 55
#define UNREGISTER_USERNAME_WARNING 33
#define MULTIPLE_LOGIN_WARNING 88
#define SERVER_FULL_WARNING 999
#define PASS_SECURITY_CHECK 111

struct LeaderBoard {
	string username;
	int win;
	int lose;
	int win_rate;
};

struct Userdata {
	string username;
	string password;
};

class Handler{
public:
	static vector<string> login_list;

	static void PreInitServer();

	static void InitSessions();


	static int getMaxPlayerSize();


	static void registerAcc(webSocket server, int clientID, string decoded_message);
	
	static void sendLeaderboard(webSocket, int clientID, int rank);

	static bool runSecurityCheck(webSocket server, int clientID, Userdata userdata);
	static void GrantSessionEntrance(webSocket server, int clientID, Userdata userdata);

	static void AddSession(webSocket server, int clientID, string message);
	static void JoinSession(webSocket server, int clientID, string message);
	static void VerifyRoomPassword(webSocket server, int clientID, string message);
	static int GetSessionid(int clientID);
	static string GetPlayerName(int clientID, int session_id);

	static void InviteHandler(webSocket server, int clientID, string message);
	static void JoinInvitedSession(webSocket server, int clientID, string message);
	static void DenyInvitedSession(webSocket server, int clientID, string message);
	static bool PlayerInSession(int clientID);
	static int GetClientIDByName(string username);
	static int FindHostClientID(int session_id);


	static void addPlayer(webSocket server, int clientID, Userdata userdata);

	static void removePlayer(webSocket server, int clientID);
	static void readyPlayer(webSocket server, int clientID);
	static void runGame(webSocket server,int session_id);
	static void endGame(webSocket server, int session_id, int clientID);    //triggered when the game is end
	static void updateWin(int session_id, int clientID);
	static void updateLose(int session_id, int clientID);
	static void updateGameState(webSocket server, int session_id, int clientID, string message);
	static void directionHandle(webSocket server, int clientID, string message, int session_id);
	static void positionHandler(webSocket server, int clientID, string message,int session_id);
	static void bombHandler(webSocket server, int clientID, string message, int session_id);
	static void powerupMapHandler(webSocket server, int clientID, string message,int session_id);
	static void addPowerUpHandler(webSocket server, int clientID, string message, int session_id);
	static void deathHandler(webSocket server, int clientID, string message, int session_id);
	static void serveMessage(webSocket server, int clientID, string message);

private:
	//static vector<Player> player;
	static vector<Session> sessions;
	static int maxSessionSize;
	static int maxPlayerSize;

	//-------------Private Helpers
	static void _chooseRandomHost(webSocket server,int clientID);
	static void _grantLobbyEntrance(webSocket server, int clientID,int playerid);
	static void _sendPlayersInfo(webSocket server, int sessionID);
	static void _sendJoiningNotification(webSocket server, int clientID);
	static int _security_check(webSocket server, Userdata userdata);//Security door of login
	static void _initPlyaerInfo(webSocket server, int clientID);
	static bool _checkReadyGame(int session_id);
	static void _grantStartGame(webSocket server, int session_id);
	static void _split(const string& s, char delim, vector<string>& v);
	static void _read_database();
	static void _read_leaderboard();
	static void _write_database();
	static void _write_leaderboard();
	static void _add_to_database(Userdata userdata);
	static void _add_to_leaderboard(LeaderBoard leaderboard);
	static void _sort_leaderboard();
	static bool _win_rate_less_than(LeaderBoard l1, LeaderBoard l2);
	static bool _check_duplicated_usernames(string username);
	static string _find_user_password(string username);//return user's password on database
	static Userdata _decrypt_userdata(string message);
	static bool _check_user_login(string username);
	static void _sendSessionInfo(webSocket);
	static bool _checkAvailableSession();

	static vector<Userdata> Database;
	static vector<LeaderBoard> Leaderboard;
};