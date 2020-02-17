const WebSocket = require('ws');

const ws = new WebSocket('ws://localhost:3000/');

ws.on ('open', () => {

console.log("Successful conntected  client 2 to the server");

//send new message from this client to server

ws.send("Hello server my name is client 2");

//listen new message

ws.on('message', (message) =>{

    console.log(message);

});

});

