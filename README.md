# multiplayer-web-bomberman
ICS 168 project consist of both client and server

Client Features

-Written in HTML5/Javascript/CSS/jQuery

-Sound/sound effects

-Support Chrome/Microsoft Edge

-Disconnection handle and ping estimation display

Intro Scene

    Register: with username/password
    Connect: with username/password
    Leaderboard: ranking info (no login required)
    System log: displaying connect info
    Introduction: control and player info

Session Scene

    Session canvas: render session state
    Join room: with room number
    Create room: with name and password (optional)

Lobby Scene

    Lobby canvas: render lobby state
    Chat log: for players communication
    Invite Player: with name (host-only)
    Ready: click to ready up (non-host)
    Start Game: click to start game (non-host)
    Back: return to session scene

Game Scene

    Player name display
    WASD movement: using keystate prediction/keyup synchronization
    Space drop bomb: bomb is solid, and using centralized synchronization
    Power-ups: speed+/-, bomb range/limit +

Endgame Scene

    Winner info display
    Endgame background
    Return to lobby: click to return lobby

Easy to access

    The client is placed in an apache with all sounds and assets cached.
    Play the game at  www.ics168ti.com (Chrome suggested)



Server Features

Written in C++

Using websocket/TCP

Security

    Duplicated username prohibited
    Same user multiple login prohibited
    Non existent user login prohibited
    Username/password mismatch login prohibited
    Using sha256 for password hash, and sha1 for websocket communication encryption

Files to read/write

    database.txt
    leaderboard.txt

Capacity

    Allow 100 users login
    Allow 9 sessions to be running, each session can have up to 4 players

Communication

    Ping estimation: Using NTP round trip for ping estimation.
    High efficiency: Server only forward critical update information.
    High responsiveness: Player move will act and send at the same time, no need to wait for server grant.
    Synchronization: Using TCP for guaranteed package delivery, and position sync will be performed on each keyup. Rollback will be performed if desynchronization is detected, which makes sure the game is synchronized while having up to 2500+ ms latency, and beyond that, disconnection may occur.

Webservice and Hosting

    1&1 domain name “168ti” hosting.
    Our server.exe is running on an AWS EC2 windows server instance 24/7. Server and clients are communicating with port 8080.
    Using  IIS to deploy our client script and host our website.
    Using 4 route53 DNS nameservers for both ics168ti.com and www.ics168ti.com redirection.
