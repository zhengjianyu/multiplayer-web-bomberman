function Session(room_name) {
    this.waiting = false;
    this.running = false;
    this.room_name = room_name;
    this.room_password = "";
    this.current_players = 0;    
}