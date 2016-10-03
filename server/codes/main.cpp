#include <stdlib.h>
#include <time.h>

#include "handler.h"

using namespace std;

webSocket server;


void openHandler(int clientID) {
	/*vector<int> clientIDs = server.getClientIDs();
	if (clientIDs.size() >Handler::getMaxPlayerSize()){
	server.wsSend(clientID, "@-");
	server.wsClose(clientID);
	}*/
}

/* called when a client disconnects */
void closeHandler(int clientID) {
	vector<int> clientIDs = server.getClientIDs();
	cout << "Client: " << clientID << " left." << endl;

	if (clientIDs.size() == Handler::getMaxPlayerSize() + 1) {//***THIS BLOCK IS CRITICAL TO FIX FATAL ERROR!***
		server.wsClose(clientID);
		Handler::login_list[clientID] = "";
		return;
	}

	ostringstream os;
	/*string playername = Handler::getPlayerName(clientID);
	os << "SYSTEM: " << playername << " has leaved.";*/
	if (Handler::PlayerInSession(clientID)) {
		Handler::removePlayer(server, clientID);
		server.wsClose(clientID);
	}
	Handler::login_list[clientID] = "";
	//if (playername != "") {
	//	for (int i = 0; i < clientIDs.size(); i++) {
	//		if (clientIDs[i] != clientID)
	//			server.wsSend(clientIDs[i], os.str());
	//	}
	//}
}

/* called when a client sends a message to the server */
void messageHandler(int clientID, string message) {
	if (message[0] == '#')
		cout << message << endl;
	Handler::serveMessage(server, clientID, message);
}

/* called once per select() loop */
void periodicHandler() {
	static time_t next = time(NULL) + 10;
	time_t current = time(NULL);
	if (current >= next) {
		ostringstream os;
		string timestring = ctime(&current);
		timestring = timestring.substr(0, timestring.size() - 1);
		os << timestring;

		vector<int> clientIDs = server.getClientIDs();
		for (int i = 0; i < clientIDs.size(); i++)
			server.wsSend(clientIDs[i], os.str());

		next = time(NULL) + 10;
	}
}

bool less_than(LeaderBoard l1, LeaderBoard l2) {
	return l2.win_rate < l1.win_rate;
}

double round_to_10th(double number) {
	return floor(number * 100) / 100;
}

int main(int argc, char *argv[]) {
	//LeaderBoard l1 = { "a",7,10,int(7 / double(17)*100)};
	//LeaderBoard l2 = { "b",6,3,int(6 / double(9)*100) };
	//LeaderBoard l3 = { "c",6,2,int(6 / double(8)*100) };
	//LeaderBoard l4 = { "d",7,10,int(7 / double(17)*100) };
	//vector<LeaderBoard> lb;
	//lb.push_back(l1);
	//lb.push_back(l2);
	//lb.push_back(l3);
	//lb.push_back(l4);
	//sort(lb.begin(), lb.end(), less_than);
	//for (int i = 0; i < lb.size(); i++) {
	//	cout << lb[i].username <<": "<<lb[i].win_rate<< endl;
	//}
	

	Handler::PreInitServer();
	int port = 1234;

	/* set event handler */
	server.setOpenHandler(openHandler);
	server.setCloseHandler(closeHandler);
	server.setMessageHandler(messageHandler);
	//server.setPeriodicHandler(periodicHandler);

	/* start the chatroom server, listen to ip '127.0.0.1' and port '8000' */
	server.startServer(port);

	return 1;
}
